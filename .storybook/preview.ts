import type { Preview } from '@storybook/react'
import '../app/globals.css'
import { ThemeProvider } from '../components/theme/ThemeProvider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0a0a',
        },
        {
          name: 'library',
          value: '#0f0f0f',
        },
      ],
    },
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        mobile: {
          name: 'Mobile',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-screen bg-[#0f0f0f] p-8 dark">
          <style>{`
            * {
              transition: none !important;
              animation: none !important;
              animation-duration: 0s !important;
              animation-delay: 0s !important;
            }
          `}</style>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default preview
