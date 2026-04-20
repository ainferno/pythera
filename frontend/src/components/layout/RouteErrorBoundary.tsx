import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Container, Status } from '../ui';

type Props = { children: ReactNode };
type State = { error: Error | null };

class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Container className="py-16 flex flex-col gap-5 max-w-xl">
        <Status kind="error">
          Что-то пошло не так при отрисовке этой страницы.
          Попробуйте перезагрузить или вернуться на главную.
        </Status>
        <details className="text-xs text-[var(--color-muted)]">
          <summary className="cursor-pointer">технические детали</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">
            {this.state.error.message}
          </pre>
        </details>
        <div className="flex gap-3">
          <Button onClick={this.reset}>попробовать снова</Button>
          <Button variant="ghost" asChild>
            <Link to="/">на главную</Link>
          </Button>
        </div>
      </Container>
    );
  }
}

/**
 * Functional wrapper that resets the class boundary on route change by
 * recreating it via `key={pathname}`. Without this, an error on /booking
 * would persist after navigating to /.
 */
export function ResettableBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <RouteErrorBoundary key={pathname}>{children}</RouteErrorBoundary>;
}

export { RouteErrorBoundary };
