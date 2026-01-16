import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { AccessCheck } from './AccessCheckProvider';
import { useAccessCheckContext } from './AccessCheckContext';

describe('AccessCheck.Provider', () => {
  it('should render children with required props', () => {
    render(
      <AccessCheck.Provider baseUrl="https://example.com" apiPath="/api/v1">
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide context value to children', () => {
    const TestComponent = () => {
      const context = useAccessCheckContext();
      return (
        <div>
          <span data-testid="baseUrl">{context.baseUrl}</span>
          <span data-testid="apiPath">{context.apiPath}</span>
        </div>
      );
    };

    render(
      <AccessCheck.Provider baseUrl="https://api.test.com" apiPath="/api/v2">
        <TestComponent />
      </AccessCheck.Provider>
    );

    expect(screen.getByTestId('baseUrl')).toHaveTextContent('https://api.test.com');
    expect(screen.getByTestId('apiPath')).toHaveTextContent('/api/v2');
  });

  it('should render multiple children', () => {
    render(
      <AccessCheck.Provider baseUrl="https://example.com" apiPath="/api/v1">
        <div>First Child</div>
        <div>Second Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('should warn when baseUrl is empty in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(
      <AccessCheck.Provider baseUrl="" apiPath="/api/v1">
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'AccessCheckProvider: baseUrl is required and must be a non-empty string'
    );

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('should warn when apiPath is empty in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(
      <AccessCheck.Provider baseUrl="https://example.com" apiPath="">
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'AccessCheckProvider: apiPath is required and must be a non-empty string'
    );

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('should not warn in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(
      <AccessCheck.Provider baseUrl="" apiPath="">
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('should throw error when useAccessCheckContext is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAccessCheckContext());
    }).toThrow('useAccessCheckContext must be used within an AccessCheckProvider');

    consoleError.mockRestore();
  });
});
