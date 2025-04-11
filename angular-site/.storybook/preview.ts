import { applicationConfig, moduleMetadata, Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { TestimonialItemComponent } from '../src/app/components/testimonial-item/testimonial-item.component';
import { InsightItemComponent } from '../src/app/components/insight-item/insight-item.component';
import { BlogItemComponent } from '../src/app/components/blog-item/blog-item.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...MINIMAL_VIEWPORTS,
        desktop: {
          name: 'Desktop',
          styles: {
            height: '1080px',
            width: '1980px',
          },
        },
      },
      // defaultViewport: 'iphone14promax',
    },
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(HttpClientModule)],
    }),
    moduleMetadata({
      declarations: [TestimonialItemComponent, InsightItemComponent, BlogItemComponent],
      imports: [],
    }),
  ],
};

export default preview;
