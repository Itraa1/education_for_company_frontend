import styled from "styled-components";
import SideButton from "./SideButton";
import SideBar from "./SideBar";

export const StyledSideButton = styled(SideButton)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem;
  margin: 0 0.5rem;
  border-radius: 8px;
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    color: var(--bg-dark);
    border-color: var(--primary-color);
  }

  .icon {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
`;

export const StyledSideBar = styled(SideBar)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  width: 220px;
  min-height: 100%;
  padding: 1rem 0;
  flex-shrink: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    width: 180px;
    padding: 0.5rem 0;
  }

  @media (max-width: 480px) {
    width: 150px;
  }
`;
