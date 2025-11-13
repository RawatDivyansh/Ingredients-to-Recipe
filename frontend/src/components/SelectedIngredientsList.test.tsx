import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectedIngredientsList from './SelectedIngredientsList';

describe('SelectedIngredientsList Component', () => {
  const mockOnRemoveIngredient = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when ingredients list is empty', () => {
    const { container } = render(
      <SelectedIngredientsList ingredients={[]} onRemoveIngredient={mockOnRemoveIngredient} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render list of ingredients', () => {
    const ingredients = ['chicken', 'rice', 'tomato'];

    render(
      <SelectedIngredientsList ingredients={ingredients} onRemoveIngredient={mockOnRemoveIngredient} />
    );

    expect(screen.getByText(/selected ingredients \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText('chicken')).toBeInTheDocument();
    expect(screen.getByText('rice')).toBeInTheDocument();
    expect(screen.getByText('tomato')).toBeInTheDocument();
  });

  it('should call onRemoveIngredient when remove button is clicked', () => {
    const ingredients = ['chicken', 'rice'];

    render(
      <SelectedIngredientsList ingredients={ingredients} onRemoveIngredient={mockOnRemoveIngredient} />
    );

    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);

    expect(mockOnRemoveIngredient).toHaveBeenCalledWith('chicken');
  });

  it('should display correct count of ingredients', () => {
    const ingredients = ['chicken'];

    render(
      <SelectedIngredientsList ingredients={ingredients} onRemoveIngredient={mockOnRemoveIngredient} />
    );

    expect(screen.getByText(/selected ingredients \(1\)/i)).toBeInTheDocument();
  });

  it('should render remove button for each ingredient', () => {
    const ingredients = ['chicken', 'rice', 'tomato'];

    render(
      <SelectedIngredientsList ingredients={ingredients} onRemoveIngredient={mockOnRemoveIngredient} />
    );

    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons).toHaveLength(3);
  });
});
