export const UtterancesComments = (): JSX.Element => (
  <section
    ref={elem => {
      if (!elem) {
        return;
      }
      const scriptElem = document.createElement('script');
      scriptElem.src = 'https://utteranc.es/client.js';
      scriptElem.async = true;
      scriptElem.crossOrigin = 'anonymous';
      scriptElem.setAttribute(
        'repo',
        'felipeferrarini/desafio05-trilha-reactjs'
      );
      scriptElem.setAttribute('issue-term', 'pathname');
      scriptElem.setAttribute('label', 'spacetravelling');
      scriptElem.setAttribute('theme', 'github-dark');
      elem.appendChild(scriptElem);
    }}
  />
);
