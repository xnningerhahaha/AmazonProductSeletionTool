import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalyzeButton from './AnalyzeButton';

describe('AnalyzeButton Component', () => {
  it('should render button with text', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} />);
    const button = screen.getByText('选品分析');
    expect(button).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<AnalyzeButton onClick={handleClick} disabled={false} />);
    
    const button = screen.getByText('选品分析');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={true} />);
    const button = screen.getByText('选品分析') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<AnalyzeButton onClick={handleClick} disabled={true} />);
    
    const button = screen.getByText('选品分析');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} loading={true} />);
    const loadingText = screen.getByText('分析中...');
    expect(loadingText).toBeDefined();
  });

  it('should be disabled when loading', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} loading={true} />);
    const button = screen.getByText('分析中...') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should have correct CSS classes when enabled', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} />);
    const button = screen.getByText('选品分析');
    expect(button.className).toContain('bg-blue-600');
  });

  it('should have correct CSS classes when disabled', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={true} />);
    const button = screen.getByText('选品分析');
    expect(button.className).toContain('bg-gray-300');
  });
});
