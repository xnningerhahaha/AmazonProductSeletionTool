import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    const message = screen.getByText('加载中...');
    expect(message).toBeDefined();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="正在分析产品..." />);
    const message = screen.getByText('正在分析产品...');
    expect(message).toBeDefined();
  });

  it('should have spinner animation', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByText('加载中...').previousElementSibling;
    expect(spinner?.querySelector('.animate-spin')).toBeDefined();
  });

  it('should have correct styling', () => {
    render(<LoadingSpinner />);
    const container = screen.getByText('加载中...').parentElement;
    expect(container?.className).toContain('flex');
    expect(container?.className).toContain('items-center');
  });
});
