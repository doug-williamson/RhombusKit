import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusAccordionComponent,
  RhombusAccordionPanelComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-accordion-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusAccordionComponent,
    RhombusAccordionPanelComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Accordion"
      [hasUsage]="true"
      [apiKey]="apiKeys"
    >
      <div overview class="overview">
        <p class="overview__lead">
          An accordion stacks collapsible sections so a long page reveals one
          chunk at a time. RhombusKit's
          <code>&lt;rhombus-accordion&gt;</code> + <code>&lt;rhombus-accordion-panel&gt;</code>
          are hand-rolled on native buttons and regions — no
          <code>mat-expansion-panel</code> underneath — so they theme straight off
          the token contract and carry the full WAI-ARIA accordion keyboard model.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-accordion>
              <rhombus-accordion-panel title="Shipping" [expanded]="true">
                <p>Orders ship within two business days via tracked courier.</p>
              </rhombus-accordion-panel>
              <rhombus-accordion-panel
                title="Returns"
                description="30-day window"
              >
                <p>Unused items can be returned within 30 days for a full refund.</p>
              </rhombus-accordion-panel>
              <rhombus-accordion-panel title="Warranty">
                <p>Every product carries a two-year limited warranty.</p>
              </rhombus-accordion-panel>
            </rhombus-accordion>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              To break a long form or document into <strong>scannable, collapsible
              sections</strong> (FAQs, settings groups, an "SEO" block) where the
              user only needs one open at a time.
            </li>
            <li>
              When vertical space matters and sections are <strong>independently
              optional</strong> — let users expand just what they care about.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For switching between peer views of equal importance, use
              <a routerLink="/components/tabs">Tabs</a> — they keep one view
              visible without the vertical reflow.
            </li>
            <li>
              For collapsible <em>navigation</em> sections in a sidebar, use a
              collapsible <a routerLink="/components/nav-list">Nav List</a>.
            </li>
            <li>
              For a single show/hide of one block, a plain toggle button is
              simpler than a one-panel accordion.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/tabs">Tabs</a> — switch between peer views.</li>
            <li><a routerLink="/components/nav-list">Nav List</a> — collapsible sidebar sections.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Wrap any number of <code>&lt;rhombus-accordion-panel&gt;</code> in a
          <code>&lt;rhombus-accordion&gt;</code>. The accordion is single-expand by
          default; add <code>multi</code> to let panels open independently.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>&lt;rhombus-accordion&gt;</code> — the container. <code>[multi]="true"</code> allows several panels open at once (default is single-expand).</li>
            <li><code>&lt;rhombus-accordion-panel&gt;</code> — one section. <code>title</code> / <code>description</code> string inputs for the header, <code>[(expanded)]</code> for two-way open state, <code>[disabled]</code> to lock it.</li>
            <li><strong>Header slots</strong> — project <code>[rhombusAccordionTitle]</code> / <code>[rhombusAccordionDescription]</code> for rich header content (icon + text + badge) instead of the string inputs.</li>
            <li><strong>Body slot</strong> — the panel's default slot holds the collapsible content.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Keyboard</h2>
          <ul>
            <li><kbd>Enter</kbd> / <kbd>Space</kbd> — toggle the focused panel.</li>
            <li><kbd>Arrow Down</kbd> / <kbd>Arrow Up</kbd> — move focus to the next / previous header (wrapping).</li>
            <li><kbd>Home</kbd> / <kbd>End</kbd> — jump to the first / last header.</li>
            <li><kbd>Tab</kbd> — move into an expanded panel's content; collapsed panels are <code>inert</code> and skipped.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>The accordion routes everything through these contract tokens:</p>
          <ul>
            <li><code>--surface-0</code> — accordion background; <code>--surface-1</code> — header hover.</li>
            <li><code>--border</code> — outer border and panel dividers.</li>
            <li><code>--text-primary</code> — title; <code>--text-secondary</code> — description, body, and chevron.</li>
            <li><code>--focus-border</code> — header focus ring.</li>
            <li><code>--radius-lg</code> — outer corners; motion tokens drive the expand + chevron animation (and honour <code>prefers-reduced-motion</code>).</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Each header is a native <code>&lt;button&gt;</code> inside an
            <code>&lt;h3&gt;</code>, carrying <code>aria-expanded</code> and
            <code>aria-controls</code> pointing at its <code>role="region"</code>
            body, which is in turn labelled by the header
            (<code>aria-labelledby</code>). Collapsed bodies are <code>inert</code>,
            so their content is removed from the tab order and the accessibility
            tree until expanded. Disabled panels keep their header focusable (so
            they stay discoverable) but won't toggle. The full arrow-key model
            above follows the WAI-ARIA Accordion pattern.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Single-expand (default)</h2>
          <rhombus-accordion>
            <rhombus-accordion-panel title="Profile" [expanded]="true">
              <p>Your name, avatar, and public handle.</p>
            </rhombus-accordion-panel>
            <rhombus-accordion-panel title="Notifications">
              <p>Choose which emails and push alerts you receive.</p>
            </rhombus-accordion-panel>
            <rhombus-accordion-panel title="Billing">
              <p>Payment method, invoices, and plan.</p>
            </rhombus-accordion-panel>
          </rhombus-accordion>
        </section>

        <section class="showcase-section">
          <h2>Multi-expand</h2>
          <p class="showcase-section__lead">
            Add <code>multi</code> so several panels can stay open.
          </p>
          <rhombus-accordion multi>
            <rhombus-accordion-panel
              title="Meta title"
              description="SEO"
            >
              <p>The &lt;title&gt; tag shown in search results and browser tabs.</p>
            </rhombus-accordion-panel>
            <rhombus-accordion-panel
              title="Meta description"
              description="SEO"
            >
              <p>The snippet shown under the title in search results.</p>
            </rhombus-accordion-panel>
            <rhombus-accordion-panel title="Open Graph" description="Social">
              <p>How the page looks when shared on social platforms.</p>
            </rhombus-accordion-panel>
          </rhombus-accordion>
        </section>

        <section class="showcase-section">
          <h2>Disabled panel</h2>
          <rhombus-accordion>
            <rhombus-accordion-panel title="Available">
              <p>This section can be opened.</p>
            </rhombus-accordion-panel>
            <rhombus-accordion-panel title="Locked (upgrade required)" [disabled]="true">
              <p>Hidden behind a plan gate.</p>
            </rhombus-accordion-panel>
          </rhombus-accordion>
        </section>

        <section class="showcase-section">
          <h2>Controlled open state</h2>
          <p class="showcase-section__lead">
            Bind <code>[(expanded)]</code> to drive a panel from your component.
          </p>
          <rhombus-accordion>
            <rhombus-accordion-panel title="Advanced options" [(expanded)]="advancedOpen">
              <p>Open: <strong>{{ advancedOpen() }}</strong></p>
            </rhombus-accordion-panel>
          </rhombus-accordion>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    rhombus-accordion {
      max-width: 560px;
    }
  `,
})
export default class AccordionPageComponent {
  protected readonly apiKeys = [
    'RhombusAccordionComponent',
    'RhombusAccordionPanelComponent',
  ];

  protected readonly advancedOpen = signal(false);

  /** Minimal import + usage snippet shown in the Overview / Usage tabs. */
  protected readonly usage = `import {
  RhombusAccordionComponent,
  RhombusAccordionPanelComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-faq',
  imports: [RhombusAccordionComponent, RhombusAccordionPanelComponent],
  template: \`
    <rhombus-accordion>
      <rhombus-accordion-panel title="Shipping" [expanded]="true">
        <p>Orders ship within two business days.</p>
      </rhombus-accordion-panel>
      <rhombus-accordion-panel title="Returns" description="30-day window">
        <p>Return unused items within 30 days.</p>
      </rhombus-accordion-panel>
    </rhombus-accordion>
  \`,
})
export class FaqComponent {}`;
}
