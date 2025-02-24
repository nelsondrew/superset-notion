import { rgba } from 'emotion-rgba';
import { css, SupersetTheme, t } from '@superset-ui/core';
import styled from '@emotion/styled';
import { List, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useLayoutEffect, useState, useCallback, useMemo, memo } from 'react';
import { isNull, throttle } from 'lodash';

const TOC_PANE_WIDTH = 374;
const SCROLL_THROTTLE_TIME = 100;
const HEADING_OFFSET = 20;

interface TableOfContentsProps {
  topOffset?: number;
}

const TOCContent = styled.div`
  padding: 32px 24px;
  background: #F8FAFC;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #E2E8F0;
  min-height: 100%;
`;

const TOCHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #E2E8F0;
  flex-shrink: 0;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1E293B;
    margin: 0;
    font-family: serif;
  }

  svg {
    color: #2563EB;
  }
`;

const TOCList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const StyledTOCItem = styled.div<{ depth: number; isActive?: boolean }>`
  padding: 8px 12px 8px ${({ depth }) => depth * 20 + 12}px;
  font-size: 14px;
  color: ${({ isActive }) => isActive ? '#2563EB' : '#334155'};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  
  // Container for title and dots
  .title-container {
    display: flex;
    width: 100%;
    align-items: baseline;
    
    // The actual title
    .title {
      white-space: nowrap;
      margin-right: 8px;
    }
    
    // Dotted line
    .dots {
      flex: 1;
      border-bottom: 2px dotted #E2E8F0;
      margin: 0 8px;
      height: 1em;
    }
  }
  
  &:hover {
    color: #2563EB;
    
    .dots {
      border-bottom-color: ${rgba('#2563EB', 0.3)};
    }
  }

  ${({ isActive }) => isActive && `
    background: ${rgba('#2563EB', 0.08)};
    font-weight: 500;
    
    .dots {
      border-bottom-color: ${rgba('#2563EB', 0.3)};
    }
  `}

  svg {
    width: 16px;
    height: 16px;
    opacity: ${({ depth }) => (depth === 0 ? 1 : 0.6)};
    flex-shrink: 0;
  }
`;

const TOCItem = memo(({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: TOCItemData; 
  isActive: boolean; 
  onClick: (id: string) => void;
}) => {
  // Helper function to parse HTML content and check if it's empty
  const parseHTML = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    // Remove zero-width spaces and trim
    const cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    return cleaned;
  };

  // Skip rendering if title is empty or only contains special characters
  const parsedTitle = parseHTML(item.title);
  if (!parsedTitle) return null;

  return (
    <StyledTOCItem
      depth={item.depth}
      isActive={isActive}
      onClick={() => onClick(item.id)}
    >
      {item.depth === 0 && <FileText size={16} />}
      <div className="title-container">
        <span className="title">{parsedTitle}</span>
        <div className="dots" />
      </div>
    </StyledTOCItem>
  );
});

const TOCContainer = styled.div`
  position: absolute;
  height: 100%;
  width: ${TOC_PANE_WIDTH}px;
  background-color: #F8FAFC;
  right: 0;
  padding: 16px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

interface TOCItemData {
  id: string;
  title: string;
  depth: number;
  isActive?: boolean;
}

const getOrderedHeadings = (pagesData: Record<string, { index: number; headings: string[] }>) => {
  if (!pagesData) return [];
  
  // Helper function to check if string is empty or only contains whitespace/special chars
  const isEmptyOrSpecialChars = (str: string) => {
    // Remove HTML entities like &nbsp;
    const withoutEntities = str.replace(/&[a-zA-Z0-9]+;/g, '');
    // Remove HTML tags
    const withoutTags = withoutEntities.replace(/<[^>]*>/g, '');
    // Remove zero-width spaces and other special characters
    const trimmed = withoutTags
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    // Check if anything meaningful remains
    return trimmed.length === 0;
  };
  
  // Process all operations in a single pass
  const orderedHeadings = Object.entries(pagesData)
    .sort(([, a], [, b]) => a.index - b.index)
    .flatMap(([, { headings }]) => headings)
    .map(id => {
      const element = document.getElementById(id);
      if (!element || !element.innerHTML) return null;
      
      // Skip if content is empty or only contains special characters
      const cleanContent = element.innerHTML
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();
      if (isEmptyOrSpecialChars(cleanContent)) return null;
      
      return {
        id,
        title: cleanContent,
        depth: element.tagName === 'H1' ? 0 : 1,
      };
    })
    .filter(Boolean) as TOCItemData[];

  return orderedHeadings;
};

const TableOfContents = memo(({ topOffset = 0 }: TableOfContentsProps) => {
  const pagesData = useSelector((state: any) => state?.dashboardInfo?.metadata?.pagesData);
  const [toc, setToc] = useState<TOCItemData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleScroll = useCallback(
    throttle(() => {
      if (!toc.length) return;

      const headingElements = toc
        .map(item => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];
      
      const headingPositions = headingElements.map(element => ({
        id: element.id,
        position: element.getBoundingClientRect().top - topOffset - HEADING_OFFSET
      }));

      const activeHeading = headingPositions.find(({ position }) => position >= 0) 
        || headingPositions[headingPositions.length - 1];

      if (activeHeading?.id !== activeId) {
        setActiveId(activeHeading?.id ?? null);
      }
    }, SCROLL_THROTTLE_TIME),
    [toc, topOffset, activeId]
  );

  const handleTOCItemClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const scrollPosition = absoluteElementTop - topOffset - HEADING_OFFSET;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [topOffset]);

  useLayoutEffect(() => {
    if (!pagesData) return;
    
    const timeoutId = setTimeout(() => {
      const orderedHeadings = getOrderedHeadings(pagesData);
      setToc(orderedHeadings);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pagesData]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      handleScroll.cancel(); // Cancel any pending throttled calls
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const containerStyle = useMemo(() => css`
    position: sticky;
    right: 0;
    top: ${topOffset}px;
    height: calc(100vh - ${topOffset}px);
    width: ${TOC_PANE_WIDTH}px;
    overflow: hidden;
  `, [topOffset]);

  if (!toc.length) return null;

  return (
    <div css={containerStyle}>
      <TOCContainer>
        <TOCContent>
          <TOCHeader>
            <List size={20} />
            <h2>{t('Table of contents')}</h2>
          </TOCHeader>
          <TOCList>
            {toc
              .map(item => (
                <TOCItem
                  key={item.id}
                  item={item}
                  isActive={activeId === item.id}
                  onClick={handleTOCItemClick}
                />
              ))
              .filter(Boolean)}
          </TOCList>
        </TOCContent>
      </TOCContainer>
    </div>
  );
});

TableOfContents.displayName = 'TableOfContents';

export default TableOfContents;