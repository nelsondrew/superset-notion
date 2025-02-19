import { rgba } from 'emotion-rgba';
import { css, SupersetTheme, t } from '@superset-ui/core';
import styled from '@emotion/styled';
import { List, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useLayoutEffect, useState } from 'react';
import { isNull } from 'lodash';

const TOC_PANE_WIDTH = 374;

interface TableOfContentsProps {
  topOffset?: number;
}

const TOCContent = styled.div`
  padding: 32px 24px;
`;

const TOCHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light2};

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.grayscale.dark1};
    margin: 0;
  }

  svg {
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const TOCList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TOCItem = styled.div<{ depth: number; isActive?: boolean }>`
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
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.base};
    background: ${({ theme }) => rgba(theme.colors.primary.base, 0.08)};
  }

  ${({ isActive, theme }) => isActive && `
    background: ${rgba(theme.colors.primary.base, 0.08)};
    font-weight: 500;
  `}

  svg {
    width: 16px;
    height: 16px;
    opacity: ${({ depth }) => (depth === 0 ? 1 : 0.6)};
  }
`;

const TOCContainer = styled.div`
  position: absolute;
  height: 100%;
  width: ${TOC_PANE_WIDTH}px;
  background-color: ${({ theme }) => theme.colors.grayscale.light5};
  right: 0;
  overflow-y: auto;
  border-left: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  
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
  const orderedHeadings = Object.values(pagesData).sort((a,b) => a.index - b.index).map(item => item.headings).flat() || [];
  const orderedDomHeadings: HTMLElement[] = [];
  
  orderedHeadings.forEach((item) => {
    const element = document.getElementById(item);
    if(!isNull(element)) {
      orderedDomHeadings.push(element);
    }
  });

  const tocArray: TOCItemData[] = [];
  
  orderedDomHeadings.forEach((item) => {
    const depth = item?.tagName === 'H1' ? 0 : 1;
    const title = item?.innerHTML;
    const id = item?.id;
    tocArray.push({
      id,
      title,
      depth
    });
  });
  
  return tocArray;
};

const TableOfContents = ({ topOffset = 0 }: TableOfContentsProps) => {
  const pagesData = useSelector((state: any) => state?.dashboardInfo?.metadata?.pagesData);
  const [toc, setToc] = useState<TOCItemData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = toc.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
      
      const headingPositions = headingElements.map(element => ({
        id: element.id,
        position: element.getBoundingClientRect().top - topOffset - 20
      }));

      const activeHeading = headingPositions.find(({ position }) => position >= 0) 
        || headingPositions[headingPositions.length - 1];

      if (activeHeading && activeHeading.id !== activeId) {
        setActiveId(activeHeading.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc, topOffset, activeId]);

  const handleTOCItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const scrollPosition = absoluteElementTop - topOffset - 20;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  useLayoutEffect(() => {
    setTimeout(() => {
      const orderedHeadings = getOrderedHeadings(pagesData);
      setToc(orderedHeadings);
    }, 500);
  }, [pagesData]);

  return (
    <div
      css={css`
        position: sticky;
        right: 0;
        top: ${topOffset}px;
        height: calc(100vh - ${topOffset}px);
        width: ${TOC_PANE_WIDTH}px;
      `}
    >
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
                depth={item.depth}
                isActive={activeId === item.id}
                onClick={() => handleTOCItemClick(item.id)}
              >
                {item.depth === 0 && <FileText size={16} />}
                {item.title}
              </TOCItem>
            ))}
          </TOCList>
        </TOCContent>
      </TOCContainer>
    </div>
  );
};

export default TableOfContents;