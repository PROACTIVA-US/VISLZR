import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
}

// Wrapper with Router for components that use routing
function RouterWrapper({ children }: WrapperProps) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

// Custom render that wraps with Router
export function renderWithRouter(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: RouterWrapper, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithRouter as render };