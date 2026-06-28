import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusNavListComponent,
  RhombusNavSection,
  RhombusNavItem,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-nav-list-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusNavListComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Nav List"
      [hasUsage]="true"
      apiKey="RhombusNavListComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-nav-list&gt;</code> is a persistent, vertical,
          sectioned navigation list — the component that fills the app-shell's
          <code>shellNav</code> slot (and works as a docs sidebar or "link in
          bio" column). Router items self-highlight via
          <code>routerLinkActive</code> and render <code>aria-current="page"</code>;
          it's the first real consumer of the <code>--nav-active-bg</code> /
          <code>--nav-active-text</code> tokens.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <p class="showcase-section__lead">
            A grouped sidebar with icons, a trailing badge, an external link, and
            a disabled item. The <strong>Overview</strong> item is highlighted
            because it points at this very page — real router-driven active state.
          </p>
          <app-example [code]="usage">
            <div class="nav-list-frame">
              <rhombus-nav-list [sections]="sections" ariaLabel="Demo" />
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>As the <strong>persistent sidebar navigation</strong> inside the <a routerLink="/components/app-shell">App shell</a>'s <code>shellNav</code> slot, for a desktop-first app with several destinations.</li>
            <li>For any vertical list of links that needs section headings, icons, active state, and trailing badges — docs sidebars, settings panes, "link in bio" pages.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For a mobile-first primary nav of 3–5 destinations, use the <a routerLink="/components/bottom-nav">Bottom nav</a> instead.</li>
            <li>For a transient list of actions off a trigger, use a <a routerLink="/components/menu">Menu</a> — though menu items can now carry <code>routerLink</code> too.</li>
            <li>For switching views <em>within</em> a page, use <a routerLink="/components/tabs">Tabs</a>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/app-shell">App shell</a> — owns the layout; drop the nav list into its <code>shellNav</code> slot.</li>
            <li><a routerLink="/components/bottom-nav">Bottom nav</a> — the mobile-first counterpart.</li>
            <li><a routerLink="/components/menu">Menu</a> — transient, trigger-anchored navigation/actions.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The list is <strong>data-driven</strong>: pass an array of
          <code>RhombusNavSection</code> (each an optional <code>heading</code> +
          an array of <code>RhombusNavItem</code>) to <code>[sections]</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Drop it into the app shell</h2>
          <p>
            Mark the component with the <code>shellNav</code> slot directive — it
            supplies the <code>&lt;nav&gt;</code> landmark the shell's nav body
            otherwise lacks:
          </p>
          <rhombus-code-block language="html" [code]="shellUsage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; the item model</h2>
          <ul>
            <li>There are <strong>no content slots</strong> — the list renders from <code>[sections]</code>, so each row's icon, label, and badge come from the item object.</li>
            <li>Each <code>RhombusNavItem</code> needs a <code>label</code>; add an <code>icon</code> (RhombusIcon glyph, Material-icon fallback) and a <code>badge</code> (a count, a string, or <code>'dot'</code>).</li>
            <li>Give it a <code>routerLink</code> for router-driven highlighting (with <code>exact</code> for exact matching), or an <code>href</code> (+ <code>target</code> / <code>rel</code>) for an external link with a manual <code>active</code> flag.</li>
            <li><code>disabled</code> renders the row inert (<code>aria-disabled</code>, removed from the tab order); <code>RhombusNavSection.heading</code> renders an optional group label.</li>
            <li><code>locked</code> keeps the row focusable but non-navigating: it fires the item's <code>action</code> and the list's <code>(itemAction)</code> output (for plan/feature gates) and shows a trailing lock. <code>disabled</code> takes precedence over <code>locked</code>.</li>
            <li><code>trailingIcon</code> adds a glyph after the label (e.g. a <code>chevron_right</code> for link rows).</li>
            <li>On a <code>RhombusNavSection</code>, <code>collapsible</code> makes the heading a disclosure toggle (seed with <code>expanded</code>).</li>
            <li>Give an item <code>children</code> for one level of nesting — a navigable parent (with <code>routerLink</code>) gets a row plus a disclosure toggle for its indented child rows; a parent without a link target toggles from its whole row (seed with <code>expanded</code>).</li>
            <li>Set <code>appearance="list"</code> on the component for full-width "link-row" cells; the default is <code>"sidebar"</code>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>The list is bespoke, light-DOM markup styled entirely from contract tokens and the geometry/motion primitives:</p>
          <ul>
            <li><code>--nav-active-bg</code> / <code>--nav-active-text</code> — the active row's fill and text</li>
            <li><code>--surface-1</code> — hover background; <code>--text-secondary</code> / <code>--text-primary</code> — idle / hover text</li>
            <li><code>--text-muted</code> — section heading; <code>--surface-2</code> — badge background</li>
            <li><code>--radius-md</code> / <code>--radius-full</code> — row corner / badge pill</li>
            <li><code>--motion-duration-fast</code> — hover transition; <code>--focus-border</code> — keyboard focus ring</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The list is a <code>&lt;nav&gt;</code> landmark whose
            <code>aria-label</code> defaults to <code>"Primary"</code> (override
            via <code>ariaLabel</code>), wrapping a semantic <code>&lt;ul&gt;</code>
            per section. Items are real <code>&lt;a&gt;</code> links, so keyboard
            order and activation are native; the active item carries
            <code>aria-current="page"</code>. Icons are decorative. Disabled items
            set <code>aria-disabled="true"</code> with <code>tabindex="-1"</code>
            and no link, so they're skipped by the keyboard and assistive tech.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Ungrouped (no headings)</h2>
          <p class="showcase-section__lead">
            Omit <code>heading</code> for a flat list — pass a single section.
          </p>
          <div class="nav-list-frame">
            <rhombus-nav-list [sections]="flat" ariaLabel="Flat" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Badges &amp; a dot marker</h2>
          <div class="nav-list-frame">
            <rhombus-nav-list [sections]="badges" ariaLabel="Badges" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Locked items</h2>
          <p class="showcase-section__lead">
            A <code>locked</code> item stays focusable and, instead of
            navigating, fires <code>(itemAction)</code> (and its own
            <code>action</code>) so you can open an upgrade sheet — with a
            trailing lock affordance. Activate <em>Advanced reports</em> below:
            {{ lastLocked() || 'nothing yet' }}.
          </p>
          <div class="nav-list-frame">
            <rhombus-nav-list
              [sections]="locked"
              ariaLabel="Locked"
              (itemAction)="onLocked($event)"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Collapsible sections</h2>
          <p class="showcase-section__lead">
            Set <code>collapsible</code> on a section to turn its heading into a
            disclosure toggle (<code>aria-expanded</code> + a rotating chevron).
            Seed the initial state with <code>expanded</code>.
          </p>
          <div class="nav-list-frame">
            <rhombus-nav-list [sections]="collapsible" ariaLabel="Collapsible" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Navigable nested tree</h2>
          <p class="showcase-section__lead">
            Give an item <code>children</code> to make it a navigable parent: a
            row that both routes (a real anchor) <em>and</em> carries a
            disclosure toggle for its indented child rows
            (<code>aria-expanded</code> + <code>aria-controls</code>). A parent
            with no link target toggles from its whole row. Seed each parent with
            <code>expanded</code>; one level of nesting is supported.
          </p>
          <div class="nav-list-frame">
            <rhombus-nav-list [sections]="tree" ariaLabel="Docs" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>List appearance (link-in-bio)</h2>
          <p class="showcase-section__lead">
            <code>appearance="list"</code> renders full-width, prominent rows
            (leading icon · label · trailing chevron) — for link-in-bio and
            link-row pages.
          </p>
          <div class="nav-list-frame nav-list-frame--wide">
            <rhombus-nav-list
              [sections]="links"
              appearance="list"
              ariaLabel="Links"
            />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
    .nav-list-frame {
      width: 100%;
      max-width: 264px;
      padding: 12px;
      background: var(--surface-0);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .nav-list-frame--wide {
      max-width: 420px;
    }
  `,
})
export default class NavListPageComponent {
  /** Last locked item the visitor activated (demonstrates (itemAction)). */
  protected readonly lastLocked = signal<string>('');
  protected onLocked(item: RhombusNavItem): void {
    this.lastLocked.set(`activated "${item.label}"`);
  }

  protected readonly locked: RhombusNavSection[] = [
    {
      heading: 'Reports',
      items: [
        { label: 'Overview', icon: 'dashboard', routerLink: '/components/nav-list', exact: true },
        { label: 'Advanced reports', icon: 'insights', locked: true },
        { label: 'Data export', icon: 'download', locked: true },
      ],
    },
  ];

  protected readonly collapsible: RhombusNavSection[] = [
    {
      heading: 'Main',
      items: [
        { label: 'Overview', icon: 'dashboard', routerLink: '/components/nav-list', exact: true },
        { label: 'Buttons', icon: 'smart_button', routerLink: '/components/button' },
      ],
    },
    {
      heading: 'Account',
      collapsible: true,
      items: [
        { label: 'Inputs', icon: 'edit', routerLink: '/components/input' },
        { label: 'Alerts', icon: 'notifications', routerLink: '/components/alert' },
      ],
    },
    {
      heading: 'Archived',
      collapsible: true,
      expanded: false,
      items: [
        { label: 'Old project', icon: 'folder', routerLink: '/components/card' },
      ],
    },
  ];

  protected readonly tree: RhombusNavSection[] = [
    {
      heading: 'Documentation',
      items: [
        // Navigable parent: routes to its own page AND expands to children.
        {
          label: 'AppShell',
          icon: 'web_asset',
          routerLink: '/components/app-shell',
          children: [
            { label: 'API Reference', routerLink: '/components/app-shell' },
            { label: 'Theming', routerLink: '/theming' },
            { label: 'Examples', routerLink: '/components/app-shell' },
          ],
        },
        {
          label: 'Token Contracts',
          icon: 'palette',
          routerLink: '/tokens',
          expanded: false,
          children: [
            { label: 'SHELL_CONFIG', routerLink: '/tokens' },
            { label: 'SeoMeta', routerLink: '/tokens' },
          ],
        },
        // Pure parent (no route): the whole row is the disclosure toggle.
        {
          label: 'Reference',
          icon: 'menu_book',
          children: [
            { label: 'Changelog', routerLink: '/roadmap' },
            { label: 'Migration', routerLink: '/migrate' },
          ],
        },
      ],
    },
  ];

  protected readonly links: RhombusNavSection[] = [
    {
      items: [
        {
          label: 'Portfolio',
          icon: 'work',
          href: 'https://example.com',
          target: '_blank',
          rel: 'noopener',
          trailingIcon: 'chevron_right',
        },
        {
          label: 'Newsletter',
          icon: 'mail',
          href: 'https://example.com',
          target: '_blank',
          rel: 'noopener',
          trailingIcon: 'chevron_right',
        },
        {
          label: 'Book a call',
          icon: 'event',
          href: 'https://example.com',
          target: '_blank',
          rel: 'noopener',
          trailingIcon: 'chevron_right',
        },
      ],
    },
  ];

  protected readonly sections: RhombusNavSection[] = [
    {
      heading: 'Main',
      items: [
        // Points at this page, so it self-highlights via the router.
        { label: 'Overview', icon: 'dashboard', routerLink: '/components/nav-list', exact: true },
        { label: 'Buttons', icon: 'smart_button', routerLink: '/components/button', badge: 8 },
        { label: 'Cards', icon: 'grid_view', routerLink: '/components/card' },
      ],
    },
    {
      heading: 'Account',
      items: [
        { label: 'Inputs', icon: 'edit', routerLink: '/components/input' },
        { label: 'Alerts', icon: 'notifications', routerLink: '/components/alert', badge: 'dot' },
        { label: 'Billing', icon: 'credit_card', disabled: true },
      ],
    },
    {
      heading: 'Resources',
      items: [
        {
          label: 'GitHub',
          icon: 'code',
          href: 'https://github.com/doug-williamson/RhombusKit',
          target: '_blank',
          rel: 'noopener',
        },
      ],
    },
  ];

  protected readonly flat: RhombusNavSection[] = [
    {
      items: [
        { label: 'Overview', icon: 'dashboard', routerLink: '/components/nav-list', exact: true },
        { label: 'Buttons', icon: 'smart_button', routerLink: '/components/button' },
        { label: 'Cards', icon: 'grid_view', routerLink: '/components/card' },
      ],
    },
  ];

  protected readonly badges: RhombusNavSection[] = [
    {
      items: [
        { label: 'Inbox', icon: 'inbox', routerLink: '/components/nav-list', exact: true, badge: 12 },
        { label: 'Drafts', icon: 'drafts', routerLink: '/components/button', badge: 'New' },
        { label: 'Alerts', icon: 'notifications', routerLink: '/components/card', badge: 'dot' },
      ],
    },
  ];

  protected readonly usage = `import { RhombusNavListComponent, RhombusNavSection } from '@rhombuskit/core';

@Component({
  selector: 'app-root',
  imports: [RhombusNavListComponent],
  template: \`<rhombus-nav-list [sections]="sections" ariaLabel="Primary" />\`,
})
export class AppComponent {
  readonly sections: RhombusNavSection[] = [
    {
      heading: 'Main',
      items: [
        { label: 'Dashboard', icon: 'dashboard', routerLink: '/dashboard', exact: true },
        { label: 'Inbox', icon: 'inbox', routerLink: '/inbox', badge: 8 },
      ],
    },
    {
      heading: 'Account',
      items: [
        { label: 'Settings', icon: 'settings', routerLink: '/settings' },
        { label: 'Docs', icon: 'menu_book', href: 'https://example.com', target: '_blank' },
      ],
    },
  ];
}`;

  protected readonly shellUsage = `<rhombus-app-shell>
  <span shellBrand>My App</span>

  <!-- The nav list supplies the &lt;nav&gt; landmark the shell slot needs -->
  <rhombus-nav-list shellNav [sections]="sections" />

  <router-outlet />
</rhombus-app-shell>`;
}
