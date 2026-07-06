# Jekyll Redirects for Cloudflare

Really simple GH Action that just runs some NodeJS to transform the default `redirects.json` into the proper `_redirects` file.

This action should be used after any Jekyll builds, but before you deploy to Cloudflare.

## Parameters

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `output_path` | Jekyll Build Output Path (if different from the default Jekyll structure) | `_site` | No |
| `delete_redirects_json` | Delete the `redirects.json` that Jekyll creates once the rules have been adapted | `true` | No |

## Outputs

| Output | Description |
|--------|-------------|
| `success` | If the redirect rules were written successfully |

## Examples

### Basic Pipeline Usage

```yaml
jobs:
  build-site:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          cache: "npm"
          node-version: "24.15"
          package-manager-cache: true
      - name: Node Package Install
        run: npm install
      - name: Setup Ruby
        uses: ruby/setup-ruby@latest
      - name: Build with Jekyll
        # Outputs to the './_site' directory by default
        # (if changed, you must also set the output_path parameter)
        run: bundle exec jekyll build --baseurl ""
        env:
          JEKYLL_ENV: production
      - name: Adapt Redirects
        uses: socksthewolf/jekyll-cloudflare-redirects-action@latest
      - name: Upload to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ""
          CLOUDFLARE_ACCOUNT_ID: ""
        run: npx wrangler deploy
```
