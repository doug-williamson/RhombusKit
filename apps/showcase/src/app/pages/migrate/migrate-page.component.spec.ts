import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import MigratePageComponent from './migrate-page.component';

describe('MigratePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MigratePageComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(MigratePageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a checkbox for every Material and CDK row', () => {
    const el = create().nativeElement as HTMLElement;
    const boxes = el.querySelectorAll('rhombus-checkbox');
    expect(boxes.length).toBeGreaterThan(40);
    expect(el.querySelectorAll('.finder__group').length).toBe(2);
  });

  it('summarises a mixed selection: direct equivalent + a gap', () => {
    const fixture = create();
    const cmp = fixture.componentInstance as unknown as {
      toggle(api: string, checked: boolean): void;
    };
    cmp.toggle('mat-slide-toggle', true); // full → Switch
    cmp.toggle('mat-slider', true); // gap
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.finder__headline')?.textContent).toContain('1 of 2');
    expect(el.querySelector('.badge--gap')?.textContent).toContain('1');
  });

  it('offers a migration-blocker request link for a Material gap', () => {
    const fixture = create();
    const cmp = fixture.componentInstance as unknown as {
      toggle(api: string, checked: boolean): void;
    };
    cmp.toggle('mat-slider', true);
    fixture.detectChanges();

    const cta = fixture.nativeElement.querySelector('.result__cta') as HTMLAnchorElement;
    expect(cta).toBeTruthy();
    expect(cta.href).toContain('template=3-new-component-proposal.yml');
    expect(cta.href).toContain('migration-blocker');
  });

  it('tells CDK-gap users to import from @angular/cdk instead of requesting', () => {
    const fixture = create();
    const cmp = fixture.componentInstance as unknown as {
      toggle(api: string, checked: boolean): void;
    };
    cmp.toggle('cdkDrag', true); // CDK gap → no request CTA
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.result__cta')).toBeNull();
    expect(el.querySelector('.result__hint')?.textContent).toContain('cdk');
  });
});
