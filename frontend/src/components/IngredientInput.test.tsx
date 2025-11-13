import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IngredientInput from './IngredientInput';
import { ingredientService } from '../services/ingredientService';

// Mock the api module first
jest.mock('../services/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

jest.mock('../services/ingredientService');

const mockedIngredientService = ingredientService as jest.Mocked<typeof ingredientService>;

describe('IngredientInput Component', () => {
  const mockOnIngredientSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render input field', () => {
    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    expect(input).toBeInTheDocument();
  });

  it('should not trigger autocomplete with less than 2 characters', async () => {
    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    fireEvent.change(input, { target: { value: 'c' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockedIngredientService.getAutocompleteSuggestions).not.toHaveBeenCalled();
    });
  });

  it('should trigger autocomplete after debounce delay with 2+ characters', async () => {
    const mockSuggestions = {
      suggestions: [
        { id: 1, name: 'chicken', category: 'meat' },
        { id: 2, name: 'cheese', category: 'dairy' },
      ],
    };

    mockedIngredientService.getAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    fireEvent.change(input, { target: { value: 'ch' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockedIngredientService.getAutocompleteSuggestions).toHaveBeenCalledWith('ch');
    });
  });

  it('should display autocomplete suggestions', async () => {
    const mockSuggestions = {
      suggestions: [
        { id: 1, name: 'chicken', category: 'meat' },
        { id: 2, name: 'cheese', category: 'dairy' },
      ],
    };

    mockedIngredientService.getAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    fireEvent.change(input, { target: { value: 'ch' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText('chicken')).toBeInTheDocument();
      expect(screen.getByText('cheese')).toBeInTheDocument();
    });
  });

  it('should call onIngredientSelect when suggestion is clicked', async () => {
    const mockSuggestions = {
      suggestions: [
        { id: 1, name: 'chicken', category: 'meat' },
      ],
    };

    mockedIngredientService.getAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    fireEvent.change(input, { target: { value: 'ch' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText('chicken')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('chicken'));

    expect(mockOnIngredientSelect).toHaveBeenCalledWith('chicken');
  });

  it('should call onIngredientSelect when Enter is pressed', async () => {
    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    fireEvent.change(input, { target: { value: 'tomato' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnIngredientSelect).toHaveBeenCalledWith('tomato');
  });

  it('should clear input after ingredient selection', async () => {
    const mockSuggestions = {
      suggestions: [
        { id: 1, name: 'chicken', category: 'meat' },
      ],
    };

    mockedIngredientService.getAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ch' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText('chicken')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('chicken'));

    expect(input.value).toBe('');
  });

  it('should debounce autocomplete requests', async () => {
    const mockSuggestions = {
      suggestions: [
        { id: 1, name: 'chicken', category: 'meat' },
      ],
    };

    mockedIngredientService.getAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

    render(<IngredientInput onIngredientSelect={mockOnIngredientSelect} />);

    const input = screen.getByPlaceholderText(/type an ingredient/i);
    
    fireEvent.change(input, { target: { value: 'ch' } });
    jest.advanceTimersByTime(100);
    
    fireEvent.change(input, { target: { value: 'chi' } });
    jest.advanceTimersByTime(100);
    
    fireEvent.change(input, { target: { value: 'chic' } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockedIngredientService.getAutocompleteSuggestions).toHaveBeenCalledTimes(1);
      expect(mockedIngredientService.getAutocompleteSuggestions).toHaveBeenCalledWith('chic');
    });
  });
});
