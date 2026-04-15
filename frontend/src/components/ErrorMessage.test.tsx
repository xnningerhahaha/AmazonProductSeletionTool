import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Component', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="测试错误信息" />);
    const message = screen.getByText('测试错误信息');
    expect(message).toBeDefined();
  });

  it('should display error title', () => {
    render(<ErrorMessage message="测试错误信息" />);
    const title = screen.getByText('出错了');
    expect(title).toBeDefined();
  });

  it('should show retry button when onRetry provided', () => {
    render(<ErrorMessage message="测试错误信息" onRetry={() => {}} />);
    const retryButton = screen.getByText('重试');
    expect(retryButton).toBeDefined();
  });

  it('should not show retry button when onRetry not provided', () => {
    render(<ErrorMessage message="测试错误信息" />);
    const retryButton = screen.queryByText('重试');
    expect(retryButton).toBeNull();
  });

  it('should call onRetry when retry button clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="测试错误信息" onRetry={handleRetry} />);
    
    const retryButton = screen.getByText('重试');
    fireEvent.click(retryButton);
    
    expect(handleRetry).toHaveBeenCalled();
  });

  it('should have error styling', () => {
    render(<ErrorMessage message="测试错误信息" />);
    const container = screen.getByText('测试错误信息').closest('div');
    expect(container?.className).toContain('bg-red-50');
  });
});
