interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-block-label">Example Code</span>
      </div>
      <pre className="code-block">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}
