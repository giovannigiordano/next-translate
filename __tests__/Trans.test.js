import React from 'react'
import { render, cleanup } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import Trans from '../src/Trans'

const TestEnglish = ({ namespaces, logger, ...props }) => {
  return (
    <I18nProvider lang="en" namespaces={namespaces} logger={logger}>
      <Trans {...props} />
    </I18nProvider>
  )
}

describe('Trans', () => {
  afterEach(cleanup)

  describe('without components', () => {
    test('should work the same way than useTranslate', () => {
      const i18nKey = 'ns:number'
      const expected = 'The number is 42'
      const withSingular = {
        number: 'The number is {{ num }}',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with nested keys', () => {
      const i18nKey = 'ns:parent.child'
      const expected = 'The number is 42'
      const withSingular = {
        parent: {
          child: 'The number is {{ num }}',
        },
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })
  })

  describe('with components', () => {
    test('should work with HTML5 Elements', () => {
      const i18nKey = 'ns:number'
      const expectedText = 'The number is 42'
      const expectedHTML = '<h1 id="u1">The number is <b id="u2">42</b></h1>'
      const withSingular = {
        number: '<0>The number is <1>{{ num }}</1></0>',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
          components={[<h1 id="u1" />, <b id="u2" />]}
        />
      )
      expect(container.textContent).toContain(expectedText)
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work with React Components', () => {
      const i18nKey = 'ns:number'
      const expectedText = 'The number is 42'
      const expectedHTML = '<h1>The number is <b>42</b></h1>'
      const withSingular = {
        number: '<0>The number is <1>{{ num }}</1></0>',
      }
      const H1 = (p) => <h1 {...p} />
      const B = (p) => <b {...p} />

      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
          components={[<H1 />, <B />]}
        />
      )
      expect(container.textContent).toContain(expectedText)
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work with very nested components', () => {
      const i18nKey = 'ns:number'
      const expectedText = 'Is the number 42?'
      const expectedHTML = '<div><p>Is</p> <b>the <i>number</i></b> 42?</div>'
      const withSingular = {
        number: '<0><1>Is</1> <2>the <3>number</3></2> {{num}}?</0>',
      }

      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
          components={[<div />, <p />, <b />, <i />]}
        />
      )
      expect(container.textContent).toContain(expectedText)
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work without replacing the HTMLElement if the index is incorrectly', () => {
      const i18nKey = 'common:test-html'
      const expectedHTML = 'test with bad index.'
      const common = {
        'test-html': 'test <10>with bad index</10>.',
      }

      const { container } = render(
        <TestEnglish
          namespaces={{ common }}
          i18nKey={i18nKey}
          components={[<b />]}
        />
      )
      expect(container.innerHTML).toContain(expectedHTML)
    })
  })

  describe('logger', () => {
    test('should log a warn key if a key does not exist in the namespace', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:number'
      const expected =
        '[next-translate] "ns:number" is missing in current namespace configuration. Try adding "number" to the namespace "ns".'

      const withSingular = {}
      render(
        <TestEnglish namespaces={{ ns: withSingular }} i18nKey={i18nKey} />
      )
      expect(console.warn).toBeCalledWith(expected)
    })

    test('should log a warn key if a nested key does not exist in the namespace', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:parent.child'
      const expected =
        '[next-translate] "ns:parent.child" is missing in current namespace configuration. Try adding "parent.child" to the namespace "ns".'

      const withSingular = {}
      render(
        <TestEnglish namespaces={{ ns: withSingular }} i18nKey={i18nKey} />
      )
      expect(console.warn).toBeCalledWith(expected)
    })

    test('should pass the key and the namespace to the logger function if the key does not exist in the namespace', () => {
      console.log = jest.fn()
      const i18nKey = 'ns:number'
      const logger = ({ i18nKey, namespace }) =>
        console.log(`Logger: ${i18nKey} ${namespace}`)
      const expected = 'Logger: number ns'

      const withSingular = {}
      render(
        <TestEnglish
          logger={logger}
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
        />
      )
      expect(console.log).toBeCalledWith(expected)
    })
  })
})
