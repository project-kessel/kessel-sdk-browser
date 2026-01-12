import React from 'react';
import { render, screen } from '@testing-library/react';
import { AccessCheck } from './AccessCheckProvider';

describe('AccessCheck.Provider', () => {
  it('should render children', () => {
    render(
      <AccessCheck.Provider>
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should accept baseUrl prop', () => {
    render(
      <AccessCheck.Provider baseUrl="https://example.com">
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should accept apiPath prop', () => {
    render(
      <AccessCheck.Provider apiPath="/api/v2">
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should accept both baseUrl and apiPath props', () => {
    render(
      <AccessCheck.Provider
        baseUrl="https://example.com"
        apiPath="/api/v2"
      >
        <div>Test Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <AccessCheck.Provider>
        <div>First Child</div>
        <div>Second Child</div>
      </AccessCheck.Provider>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });
});
