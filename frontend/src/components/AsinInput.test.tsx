import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AsinInput from './AsinInput';

describe('AsinInput Component', () => {
  it('should render input field', () => {
    render(<AsinInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('输入ASIN码');
    expect(input).toBeDefined();
  });

  it('should display placeholder text', () => {
    render(<AsinInput value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('例如: B08N5WRWNW');
    expect(input).toBeDefined();
  });

  it('should call onChange when input changes', () => {
    const handleChange = vi.fn();
    render(<AsinInput value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText('输入ASIN码');
    fireEvent.change(input, { target: { value: 'B08N5WRWNW' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should convert input to uppercase', () => {
    const handleChange = vi.fn();
    render(<AsinInput value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText('输入ASIN码');
    fireEvent.change(input, { target: { value: 'b08n5wrwnw' } });
    
    expect(handleChange).toHaveBeenCalledWith('B08N5WRWNW');
  });

  it('should show clear button when value exists', () => {
    render(<AsinInput value="B08N5WRWNW" onChange={() => {}} />);
    const clearButton = screen.getByLabelText('清空输入');
    expect(clearButton).toBeDefined();
  });

  it('should call onClear when clear button clicked', () => {
    const handleClear = vi.fn();
    const handleChange = vi.fn();
    render(<AsinInput value="B08N5WRWNW" onChange={handleChange} onClear={handleClear} />);
    
    const clearButton = screen.getByLabelText('清空输入');
    fireEvent.click(clearButton);
    
    expect(handleClear).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should show error message for invalid ASIN after blur', () => {
    render(<AsinInput value="" onChange={() => {}} />);
    
    const input = screen.getByLabelText('输入ASIN码');
    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.blur(input);
    
    const errorMessage = screen.getByText('ASIN必须是10位字符');
    expect(errorMessage).toBeDefined();
  });

  it('should call onValidationChange with correct status', () => {
    const handleValidationChange = vi.fn();
    render(<AsinInput value="" onChange={() => {}} onValidationChange={handleValidationChange} />);
    
    const input = screen.getByLabelText('输入ASIN码');
    
    // Valid ASIN
    fireEvent.change(input, { target: { value: 'B08N5WRWNW' } });
    expect(handleValidationChange).toHaveBeenCalledWith(true);
    
    // Invalid ASIN
    fireEvent.change(input, { target: { value: 'INVALID' } });
    expect(handleValidationChange).toHaveBeenCalledWith(false);
  });

  it('should limit input to 10 characters', () => {
    render(<AsinInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('输入ASIN码') as HTMLInputElement;
    expect(input.maxLength).toBe(10);
  });
});
