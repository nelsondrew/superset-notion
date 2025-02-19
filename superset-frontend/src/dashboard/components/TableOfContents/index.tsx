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
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border-radius: 8px;
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.grayscale.light2};
  min-height: 100%;
`;

const TOCHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.grayscale.light2};
  flex-shrink: 0;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.grayscale.dark1};
    margin: 0;
    font-family: serif;
  }

  svg {
    color: ${({ theme }) => theme.colors.primary.base};
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
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary.base : theme.colors.grayscale.dark1};
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
      border-bottom: 2px dotted ${({ theme }) => theme.colors.grayscale.light2};
      margin: 0 8px;
      height: 1em;
    }
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.base};
    
    .dots {
      border-bottom-color: ${({ theme }) => rgba(theme.colors.primary.base, 0.3)};
    }
  }

  ${({ isActive, theme }) => isActive && `
    background: ${rgba(theme.colors.primary.base, 0.08)};
    font-weight: 500;
    
    .dots {
      border-bottom-color: ${rgba(theme.colors.primary.base, 0.3)};
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
}) => (
  <StyledTOCItem
    depth={item.depth}
    isActive={isActive}
    onClick={() => onClick(item.id)}
  >
    {item.depth === 0 && <FileText size={16} />}
    <div className="title-container">
      <span className="title">{item.title}</span>
      <div className="dots" />
    </div>
  </StyledTOCItem>
));

const TOCContainer = styled.div`
  position: absolute;
  height: 100%;
  width: ${TOC_PANE_WIDTH}px;
  background-color: ${({ theme }) => theme.colors.grayscale.light5};
  right: 0;
  padding: 16px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.grayscale.light3};
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
  
  // Process all operations in a single pass
  const orderedHeadings = Object.entries(pagesData)
    .sort(([, a], [, b]) => a.index - b.index)
    .flatMap(([, { headings }]) => headings)
    .map(id => {
      const element = document.getElementById(id);
      if (!element) return null;
      
      return {
        id,
        title: element.innerHTML,
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
            {toc.map(item => (
              <TOCItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onClick={handleTOCItemClick}
              />
            ))}
          </TOCList>
        </TOCContent>
      </TOCContainer>
    </div>
  );
});

TableOfContents.displayName = 'TableOfContents';

export default TableOfContents;