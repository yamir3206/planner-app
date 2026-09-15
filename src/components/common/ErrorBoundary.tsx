import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full bg-destructive/10 p-3 w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="mt-4">خطایی رخ داده است</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                متأسفانه مشکلی پیش آمده. لطفاً صفحه را دوباره بارگذاری کنید.
              </p>
              {this.state.error && (
                <pre className="text-xs bg-secondary p-3 rounded-lg text-left overflow-auto ltr" dir="ltr">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()}>بارگذاری مجدد</Button>
                <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
                  تلاش مجدد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
