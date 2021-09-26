import { html, css, LitElement } from 'https://unpkg.com/lit?module';

class TestReport extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      span {
        margin-right: 10px;
      }

      .main {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        display: flex;
        align-items: center;
        width: 100%;
        padding: 5px;
      }

      .name {
        font-weight: bold;
        width: 400px;
        display: block;
      }

      .passed {
        border-left: solid 3px #1bfa57;
      }

      .failed {
        border-left: solid 3px #eb136d;
      }

      .skipped {
        border-left: solid 3px grey;
        background-color: lightgrey;
      }

      code {
        border-left: solid 3px #eb136d;
        color: #eb136d;
        padding: 10px;
      }
    `;
  }
  static get properties() {
    return {
      testResult: {},
    };
  }

  render() {
    const { name, passed, skipped, duration, error } = this.testResult;
    console.log(error);

    return html`
      <div class="main ${passed ? 'passed' : 'failed'} ${skipped ? 'skipped' : ''}">
        <span>${skipped ? '⚫️' : passed ? '✅' : '❌'}</span><span class="name">${name}</span><span>${duration}</span>
      </div>
      ${error ? html`<code>${error.message} ${error.expects} ${error.actual}</code>` : ''}
    `;
  }

}

window.customElements.define('test-report', TestReport);