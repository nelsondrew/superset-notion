import { rgba } from 'emotion-rgba';
import { css, SupersetTheme, t } from '@superset-ui/core';
import styled from '@emotion/styled';
import { List, FileText } from 'lucide-react';

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

// Dummy data to match the image
const dummyTOC = [
  {
    id: 1,
    title: 'Text editor',
    depth: 0,
  },
  {
    id: 2,
    title: 'Plain text and rich text',
    depth: 1,
  },
  {
    id: 3,
    title: 'History',
    depth: 1,
  },
  {
    id: 4,
    title: 'Weird h5 headline',
    depth: 2,
  },
  {
    id: 5,
    title: 'Types of text editors',
    depth: 0,
    isActive: true,
  },
  {
    id: 6,
    title: 'Simple text editors',
    depth: 1,
  },
  {
    id: 7,
    title: 'Word editors',
    depth: 1,
  },
];

const TableOfContents = ({ topOffset = 0 }: TableOfContentsProps) => (
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
          {dummyTOC.map(item => (
            <TOCItem 
              key={item.id} 
              depth={item.depth}
              isActive={item.isActive}
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

export default TableOfContents; 