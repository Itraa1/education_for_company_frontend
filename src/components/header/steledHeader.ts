import styled from "styled-components";
import ProfileIcon from "../../assets/profileicon.svg?react";
import Header from "./Header";

export const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    h2 {
      font-size: 1.2rem;
    }
  }
`;

export const StyledProfileIconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: var(--bg-tertiary);

  &:hover {
    background-color: var(--bg-hover);
    transform: scale(1.05);
  }
`;

export const StyledProfileOcin = styled(ProfileIcon)`
  width: 24px;
  height: 24px;
  color: var(--text-primary);
  
  &:hover {
    cursor: pointer;
  }
`;

export const StyledProfileMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const StyledProfileMenuItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: var(--bg-hover);
    color: var(--danger-color, #ff6b9d);
  }

  &:active {
    transform: scale(0.98);
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;
