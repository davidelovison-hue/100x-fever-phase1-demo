/** Reset scroll position and mobile zoom after route changes (e.g. checkout → confirmation). */
export function scrollPageToTop(): () => void {
  const scrollTop = () => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    document
      .querySelectorAll<HTMLElement>('.appShell, .connectPage, .checkoutPage, .orderConfirmPage, .accountPage, .pmrPreBookingPage, .planPage--snap')
      .forEach((el) => {
        el.scrollTop = 0
      })
  }

  scrollTop()
  const rafId = requestAnimationFrame(scrollTop)
  const timeoutId = window.setTimeout(scrollTop, 50)

  const ae = document.activeElement
  if (ae instanceof HTMLElement) ae.blur()

  const vp = document.querySelector('meta[name="viewport"]')
  const defaultContent = 'width=device-width, initial-scale=1, viewport-fit=cover'
  let resetTimer: number | undefined
  if (vp) {
    vp.setAttribute('content', `${defaultContent}, maximum-scale=1`)
    resetTimer = window.setTimeout(() => {
      vp.setAttribute('content', defaultContent)
    }, 120)
  }

  return () => {
    cancelAnimationFrame(rafId)
    window.clearTimeout(timeoutId)
    if (resetTimer !== undefined) window.clearTimeout(resetTimer)
    if (vp) vp.setAttribute('content', defaultContent)
  }
}
