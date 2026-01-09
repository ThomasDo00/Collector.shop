import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from '@features/auth/LoginForm';
import authReducer from '@features/auth/authSlice';

describe('LoginForm', () => {
  const renderLoginForm = () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render null (component is empty)', () => {
    const { container } = renderLoginForm();
    expect(container.firstChild).toBeNull();
  });
});
