# products Specification

## Purpose

Lets signed-in users browse the product catalog as a searchable, server-paginated list and move between pages with explicit Previous and Next controls.

## Requirements

### Requirement: Products list shows a page of catalog items

The products list SHALL display one page of products from the catalog, with a page size of 20 items. Each product shown MUST include name and the nutrition/price summary already used on the list. The list MUST request the selected page from the catalog API rather than always the first page.

#### Scenario: First page of a multi-page catalog

- **WHEN** the user opens the products list and the catalog has more than 20 matching products
- **THEN** the list shows the first 20 products and reports that more pages exist

#### Scenario: Empty catalog or no matches

- **WHEN** the requested page has no products
- **THEN** the list shows an empty state and does not show product cards

### Requirement: User can search products

The products list SHALL allow the user to search by product name. Submitting a search MUST load matching products starting at page 1.

#### Scenario: Search resets to the first page

- **WHEN** the user is on page 2 or later and submits a search
- **THEN** the list requests page 1 of the search results

#### Scenario: Search with no matches

- **WHEN** the user submits a search that matches no products
- **THEN** the list shows an empty state

### Requirement: User can navigate product pages explicitly

The products list SHALL provide visible Previous and Next controls and a page indicator showing the current page and total pages (for example, "Page 2 of 5"). Activating Next MUST load the next page of the current search (replacing the current page's items). Activating Previous MUST load the previous page. Previous MUST be disabled on page 1. Next MUST be disabled on the last page and when there is no next page.

#### Scenario: Move to the next page

- **WHEN** the user is on page 1 of 3 and activates Next
- **THEN** the list shows page 2 of 3 of the same search

#### Scenario: Move to the previous page

- **WHEN** the user is on page 2 of 3 and activates Previous
- **THEN** the list shows page 1 of 3 of the same search

#### Scenario: Bounds disable navigation

- **WHEN** the user is on the only page, or on the first or last page of a multi-page result
- **THEN** Previous is disabled on the first page and Next is disabled on the last page

#### Scenario: Single-page result still shows controls

- **WHEN** the result has exactly one page
- **THEN** Previous and Next are visible and disabled, and the indicator shows page 1 of 1
