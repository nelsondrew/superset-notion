/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { ReactNode, ReactElement, useState } from 'react';
import { css, styled, SupersetTheme, t, useTheme } from '@superset-ui/core';
import { Dropdown, DropdownProps } from 'src/components/Dropdown';
import { TooltipPlacement } from 'src/components/Tooltip';
import {
  DynamicEditableTitle,
  DynamicEditableTitleProps,
} from '../DynamicEditableTitle';
import CertifiedBadge, { CertifiedBadgeProps } from '../CertifiedBadge';
import FaveStar, { FaveStarProps } from '../FaveStar';
import Icons from '../Icons';
import Button from '../Button';
import { Moon, Sun  } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from 'src/dashboard/actions/dashboardState';


export const menuTriggerStyles = (theme: SupersetTheme) => css`
  width: ${theme.gridUnit * 8}px;
  height: ${theme.gridUnit * 8}px;
  padding: 0;
  border: 1px solid ${theme.colors.primary.dark2};

  &.antd5-btn > span.anticon {
    line-height: 0;
    transition: inherit;
  }

  &:hover:not(:focus) > span.anticon {
    color: ${theme.colors.primary.light1};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.dark2};
  }
`;

const headerStyles = (theme: SupersetTheme) => css`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  background-color: ${theme.colors.grayscale.light5};
  height: ${theme.gridUnit * 16}px;
  padding: 0 ${theme.gridUnit * 4}px;

  .editable-title {
    overflow: hidden;

    & > input[type='button'],
    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      white-space: nowrap;
    }
  }

  span[role='button'] {
    display: flex;
    height: 100%;
  }

  .title-panel {
    display: flex;
    align-items: center;
    min-width: 0;
    margin-right: ${theme.gridUnit * 12}px;
  }

  .right-button-panel {
    display: flex;
    align-items: center;
  }
`;

const buttonsStyles = (theme: SupersetTheme) => css`
  display: flex;
  align-items: center;
  padding-left: ${theme.gridUnit * 2}px;

  & .fave-unfave-icon {
    padding: 0 ${theme.gridUnit}px;

    &:first-of-type {
      padding-left: 0;
    }
  }
`;

const additionalActionsContainerStyles = (theme: SupersetTheme) => css`
  margin-left: ${theme.gridUnit * 2}px;
`;

export type PageHeaderWithActionsProps = {
  editableTitleProps: DynamicEditableTitleProps;
  showTitlePanelItems: boolean;
  certificatiedBadgeProps?: CertifiedBadgeProps;
  showFaveStar: boolean;
  showMenuDropdown?: boolean;
  faveStarProps: FaveStarProps;
  titlePanelAdditionalItems: ReactNode;
  rightPanelAdditionalItems: ReactNode;
  additionalActionsMenu: ReactElement;
  menuDropdownProps: Omit<DropdownProps, 'overlay'>;
  tooltipProps?: {
    text?: string;
    placement?: TooltipPlacement;
  };
};


const ControlsContainer = styled.div`
  /* position: absolute; */
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
  margin-right: 2rem;
`


const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 70px;
  height: 32px;
  background: #E4E6EB;
  border-radius: 50px;
  cursor: pointer;
  /* margin-top: 3rem; */
  padding: 4px;
  border: ${props => props.$isDarkMode ? '1px solid white' : ''};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50px;
    background: #E4E6EB;
    transition: all 0.4s ease;
    display: flex;
    align-items: center;
    padding: 4px;

    &:before {
      content: "";
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      transition: transform 0.4s ease;
      transform: ${props => props.$isDarkMode ? 'translateX(38px)' : 'translateX(0)'};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .icon {
      position: absolute;
      width: 16px;
      height: 16px;
      color: '#000';
      z-index: 1;
      transition: all 0.4s ease;

      &.sun {
        left: 8px;
        opacity: ${props => props.$isDarkMode ? '0' : '1'};
      }

      &.moon {
        right: 8px;
        opacity: ${props => props.$isDarkMode ? '1' : '0'};
      }
    }
  }

  input:checked + span {
    background: #1A1B1E;
  }
`

export const PageHeaderWithActions = ({
  editableTitleProps,
  showTitlePanelItems,
  certificatiedBadgeProps,
  showFaveStar,
  faveStarProps,
  titlePanelAdditionalItems,
  rightPanelAdditionalItems,
  additionalActionsMenu,
  menuDropdownProps,
  showMenuDropdown = true,
  tooltipProps,
}: PageHeaderWithActionsProps) => {
  const theme = useTheme();
  const isDarkMode = useSelector((state) => state?.dashboardState?.darkMode);
  const dispatch = useDispatch();

  const toggleTheme = () => {
    dispatch(toggleDarkMode(!isDarkMode))
  }
  return (
    <div css={headerStyles} className="header-with-actions">
      <div className="title-panel">
        <DynamicEditableTitle {...editableTitleProps} />
        {showTitlePanelItems && (
          <div css={buttonsStyles}>
            {certificatiedBadgeProps?.certifiedBy && (
              <CertifiedBadge {...certificatiedBadgeProps} />
            )}
            {showFaveStar && <FaveStar {...faveStarProps} />}
            {titlePanelAdditionalItems}
          </div>
        )}
      </div>
      <div className="right-button-panel">
      <ControlsContainer>
        <ToggleSwitch $isDarkMode={isDarkMode}>
          <input 
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <span>
            <Moon className="icon moon" size={16} />
            <Sun className="icon sun" size={16} />
          </span>
        </ToggleSwitch>
      </ControlsContainer>
        {rightPanelAdditionalItems}
        <div css={additionalActionsContainerStyles}>
          {showMenuDropdown && (
            <Dropdown
              trigger={['click']}
              dropdownRender={() => additionalActionsMenu}
              {...menuDropdownProps}
            >
              <Button
                css={menuTriggerStyles}
                buttonStyle="tertiary"
                aria-label={t('Menu actions trigger')}
                tooltip={tooltipProps?.text}
                placement={tooltipProps?.placement}
                data-test="actions-trigger"
              >
                <Icons.MoreHoriz
                  iconColor={theme.colors.primary.dark2}
                  iconSize="l"
                />
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
};
