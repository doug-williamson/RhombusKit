import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { API_METADATA, type ApiEntry } from '../../generated/api-metadata';

/**
 * Renders the generated public-API metadata as selector + Inputs / Outputs /
 * Methods / Slots / Types tables. The data is produced by `tools/api-snapshot.mjs`
 * from the built type surface, so it can't drift from the real API.
 *
 * `apiKey` accepts a single export name or an array — a feature that ships more
 * than one public symbol (a panel + its trigger directive, a service + its
 * components) documents them all on one page:
 *
 *   <app-api-table [apiKey]="['RhombusPopoverComponent',
 *     'RhombusPopoverTriggerDirective', 'RhombusPopoverCloseDirective']" />
 */
@Component({
  selector: 'app-api-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @let list = entries();
    @let multi = list.length > 1;
    @for (item of list; track item.key) {
      @let e = item.entry;
      @if (e) {
        <section class="api-table__entry">
          @if (multi) {
            <h2 class="api-table__entry-heading">
              <code>{{ e.selector || e.name }}</code>
            </h2>
          } @else if (e.selector) {
            <p class="api-table__selector">
              <span class="api-table__label">Selector</span>
              <code>{{ e.selector }}</code>
            </p>
          }

          @if (e.inputs.length) {
            <h3 class="api-table__heading">Inputs</h3>
            <table class="api-table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                @for (m of e.inputs; track m.name) {
                  <tr>
                    <td class="api-table__name">
                      <code>{{ m.name }}</code>
                      @if (m.required) {
                        <span class="api-table__req" title="Required">required</span>
                      }
                    </td>
                    <td>
                      <code>{{ m.type }}</code>
                      @if (m.enumValues?.length) {
                        <span class="api-table__values">
                          @for (v of m.enumValues; track v) {
                            <code class="api-table__value">'{{ v }}'</code>
                          }
                        </span>
                      }
                    </td>
                    <td>{{ m.description || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }

          @if (e.outputs.length) {
            <h3 class="api-table__heading">Outputs</h3>
            <table class="api-table">
              <thead>
                <tr><th>Name</th><th>Payload</th><th>Description</th></tr>
              </thead>
              <tbody>
                @for (m of e.outputs; track m.name) {
                  <tr>
                    <td class="api-table__name"><code>{{ m.name }}</code></td>
                    <td><code>{{ m.type }}</code></td>
                    <td>{{ m.description || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }

          @if (e.methods.length) {
            <h3 class="api-table__heading">Methods</h3>
            <table class="api-table">
              <thead>
                <tr><th>Name</th><th>Signature</th><th>Description</th></tr>
              </thead>
              <tbody>
                @for (m of e.methods; track m.name) {
                  <tr>
                    <td class="api-table__name"><code>{{ m.name }}</code></td>
                    <td><code>{{ m.type }}</code></td>
                    <td>{{ m.description || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }

          @if (e.slots?.length) {
            <h3 class="api-table__heading">Slots</h3>
            <table class="api-table">
              <thead>
                <tr><th>Selector</th><th>Description</th></tr>
              </thead>
              <tbody>
                @for (s of e.slots; track s) {
                  <tr>
                    <td class="api-table__name">
                      <code>{{ s === '*' ? '(default)' : s }}</code>
                    </td>
                    <td>
                      {{
                        s === '*'
                          ? 'Default content projection slot.'
                          : 'Named content projection slot.'
                      }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

          @if (e.types?.length) {
            <h3 class="api-table__heading">Types</h3>
            @for (t of e.types; track t.name) {
              <p class="api-table__type-name"><code>{{ t.name }}</code></p>
              <table class="api-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (f of t.members; track f.name) {
                    <tr>
                      <td class="api-table__name">
                        <code>{{ f.name }}</code>
                        @if (f.required) {
                          <span class="api-table__req" title="Required">required</span>
                        }
                      </td>
                      <td><code>{{ f.type }}</code></td>
                      <td>{{ f.description || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          }

          @if (
            !e.inputs.length &&
            !e.outputs.length &&
            !e.methods.length &&
            !e.slots?.length
          ) {
            <p class="api-table__empty">
              This export has no public inputs, outputs, or methods — see its usage
              on the Examples tab.
            </p>
          }
        </section>
      } @else {
        <p class="api-table__empty">
          No API metadata found for <code>{{ item.key }}</code>.
        </p>
      }
    }
  `,
  styles: `
    .api-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5rem 0 2rem;
      font-size: 0.9rem;

      th,
      td {
        text-align: left;
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid var(--border);
        vertical-align: top;
      }

      th {
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      td {
        color: var(--text-primary);
      }

      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        background-color: var(--surface-1);
        padding: 0.1em 0.4em;
        border-radius: 0.25em;
        white-space: pre-wrap;
      }

      &__name code {
        color: var(--text-accent);
      }
    }

    .api-table__entry + .api-table__entry {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }

    .api-table__entry-heading {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0 0 1.25rem;

      code {
        font-family: var(--font-mono);
        font-size: 0.92em;
        background-color: var(--surface-1);
        padding: 0.2em 0.5em;
        border-radius: 0.25em;
        color: var(--text-accent);
      }
    }

    .api-table__heading {
      font-size: 1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.5rem;
    }

    .api-table__type-name {
      margin: 1.5rem 0 0.25rem;

      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        font-weight: 600;
        color: var(--text-accent);
        background-color: var(--surface-1);
        padding: 0.15em 0.45em;
        border-radius: 0.25em;
      }
    }

    .api-table__selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1.5rem;

      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        background-color: var(--surface-1);
        padding: 0.2em 0.5em;
        border-radius: 0.25em;
        color: var(--text-accent);
      }
    }

    .api-table__label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-secondary);
    }

    .api-table__req {
      display: inline-block;
      margin-left: 0.5em;
      font-family: var(--font-sans);
      font-size: 0.62rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-accent);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-sm);
      padding: 0.05em 0.4em;
      vertical-align: middle;
    }

    .api-table__values {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.3em;
      margin-left: 0.4em;

      code {
        background-color: var(--surface-2);
        color: var(--text-secondary);
      }
    }

    .api-table__empty {
      color: var(--text-secondary);
    }
  `,
})
export class ApiTableComponent {
  /** One export name, or several to document on a single page. */
  readonly apiKey = input.required<string | readonly string[]>();

  protected readonly entries = computed<
    { key: string; entry: ApiEntry | null }[]
  >(() => {
    const raw = this.apiKey();
    const keys = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    return keys.map((key) => ({ key, entry: API_METADATA[key] ?? null }));
  });
}
