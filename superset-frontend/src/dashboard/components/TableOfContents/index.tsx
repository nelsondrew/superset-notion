import { rgba } from 'emotion-rgba';
import { css, SupersetTheme, t } from '@superset-ui/core';
import styled from '@emotion/styled';
import { List, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useLayoutEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import { isNull, throttle } from 'lodash';

const TOC_PANE_WIDTH = 374;
const SCROLL_THROTTLE_TIME = 100;
const HEADING_OFFSET = 20;

interface TableOfContentsProps {
  topOffset?: number;
}

const TOCContent = styled.div`
  padding: 32px 24px;
  background: white;
  border-radius: 8px;

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
    color: black;
  }
`;

const TOCList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const StyledTOCItem = styled.div<{ depth: number; isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  margin-left: ${props => props.depth * 16}px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #F5F5F5;
  }
  
  ${props => props.isActive && css`
    background-color: #E5E5E5;
    
    .title {
      color: #171717;
      font-weight: 500;
    }
    
    .dots {
      border-bottom-color: #A3A3A3;
    }
  `}
  
  .title-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    
    .title {
      color: #525252;
      font-size: 14px;
      transition: color 0.2s ease;
    }
    
    .dots {
      flex: 1;
      border-bottom: 1px dotted #D4D4D4;
      margin: 0 4px;
    }
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

const TOCMinimized = styled.div`
  position: fixed;
  right: 8px;
  top: 100px;
  bottom: 100px;
  display: flex;
  width: 12rem;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  background: transparent;
  z-index: 99;
  justify-content: center;
  padding-right: 10px;
  
  .toc-line {
    position: relative;
    width: 24px;
    height: 2px;
    border-radius: 1px;
    transition: all 0.2s ease;
    cursor: pointer;
    margin-left: auto;
    
    &::before {
      content: '';
      position: absolute;
      right: -100px;
      top: -11px;
      width: 120px;
      height: 24px;
      background: transparent;
    }
    
    &.active {
      background: #000000;
      width: 32px;
    }
    
    &.inactive {
      background: #D1D5DB;
      width: 24px;
      opacity: 0.5;
      
      &:hover {
        background: #6B7280;
        opacity: 1;
        width: 28px;
      }
    }
  }
`;

const TOCContainer = styled.div<{ $isExpanded: boolean }>`
  position: fixed;
  max-height: 300px;
  width: ${TOC_PANE_WIDTH}px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  right: 40px;
  padding: 12px;
  overflow-y: auto;
  transition: all 0.3s ease;
  transform: ${props => props.$isExpanded ? 'translateX(0)' : 'translateX(20px)'};
  opacity: ${props => props.$isExpanded ? '1' : '0'};
  visibility: ${props => props.$isExpanded ? 'visible' : 'hidden'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
  
  &::-webkit-scrollbar {
    width: 4px;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleMouseEnter = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsExpanded(false);
  }, []);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isExpanded) return;

      const tocElement = tocRef.current;
      const modalElement = modalRef.current;

      if (!tocElement || !modalElement) return;

      const tocRect = tocElement.getBoundingClientRect();
      const modalRect = modalElement.getBoundingClientRect();

      const isInToc = e.clientX >= tocRect.left && 
        e.clientX <= tocRect.right && 
        e.clientY >= tocRect.top && 
        e.clientY <= tocRect.bottom;

      const isInModal = e.clientX >= modalRect.left && 
        e.clientX <= modalRect.right && 
        e.clientY >= modalRect.top && 
        e.clientY <= modalRect.bottom;

      if (!isInToc && !isInModal) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isExpanded]);

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
      <TOCMinimized 
        ref={tocRef}
        onMouseEnter={() => {
          setIsExpanded(true)
        }}
      >
        {toc.map(item => (
          <div
            key={item.id}
            className={`toc-line ${activeId === item.id ? 'active' : 'inactive'}`}
            onClick={() => handleTOCItemClick(item.id)}
            onMouseEnter={() => {
              setIsExpanded(true);
              setActiveId(item.id);
            }}
          />
        ))}
      </TOCMinimized>
      
      <TOCContainer 
        ref={modalRef}
        $isExpanded={isExpanded}
        style={{
          top: '50%',
          transform: `translateY(-50%) ${isExpanded ? 'translateX(2rem)' : 'translateX(20px)'}`
        }}
      >
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