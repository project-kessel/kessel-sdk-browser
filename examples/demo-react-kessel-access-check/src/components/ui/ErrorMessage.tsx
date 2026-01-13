interface ErrorMessageProps {
  error: {
    code?: number | string;
    message: string;
    details?: unknown[];
  };
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        {error.code && <div className="error-code">Error {error.code}</div>}
        <div className="error-text">{error.message}</div>
      </div>
    </div>
  );
}
