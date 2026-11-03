import { useEffect, useId, useMemo, useState } from 'react';
import { formatPrice } from '../lib/formatPrice';
import './InstallmentsPicker.css';

export type InstallmentPlanId = 0 | 3 | 4 | 5 | 6;

type InstallmentsPickerProps = {
  total: number;
  /** Booking / service fee — part of “due today”. */
  serviceFee?: number;
};

type PlanOption = {
  id: InstallmentPlanId;
  count: number;
  label: string;
  sublabel?: string;
  totalLabel: string;
  perInstallment: number;
  dueToday: number;
  deposit: number;
  bookingFees: number;
};

type ModalStep = 'list' | 'confirm';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** CMP: 5% of order total due first (deposit). */
function computeDeposit(total: number): number {
  if (total <= 0) return 0;
  return round2(total * 0.05);
}

/** CMP payment-plan fee charged with the initial payment. */
const PLAN_FEE = 50;

function buildPlans(total: number, serviceFee: number): PlanOption[] {
  const bookingFees = round2(Math.max(0, serviceFee) + PLAN_FEE);
  const deposit = Math.min(total, computeDeposit(total));
  const dueToday = round2(deposit + bookingFees);
  const remainder = Math.max(0, round2(total - deposit));
  const planTotal = round2(total + PLAN_FEE);

  const plans: PlanOption[] = [
    {
      id: 0,
      count: 0,
      label: 'No installments',
      totalLabel: `Total ${formatPrice(total)}`,
      perInstallment: 0,
      dueToday: total,
      deposit: 0,
      bookingFees: 0,
    },
  ];

  for (const count of [3, 4, 5, 6] as const) {
    const per = round2(remainder / count);
    plans.push({
      id: count,
      count,
      label: `${count} x of ${formatPrice(per)}`,
      sublabel: dueToday > 0 ? `${formatPrice(dueToday)} initial payment` : undefined,
      totalLabel: `Total ${formatPrice(planTotal)}`,
      perInstallment: per,
      dueToday,
      deposit,
      bookingFees,
    });
  }

  return plans;
}

function planSummaryLabel(planId: InstallmentPlanId, plans: PlanOption[]): string {
  if (planId === 0) return 'No installments';
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return 'No installments';
  return `${formatPrice(plan.dueToday)} down + ${plan.count} installments`;
}

function installmentDates(count: number, from = new Date()): string[] {
  const labels: string[] = [];
  for (let i = 1; i <= count; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, from.getDate());
    labels.push(
      d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      }),
    );
  }
  return labels;
}

const TERMS_URL = 'https://feverup.com/legal/terms';

export function InstallmentsPicker({ total, serviceFee = 0 }: InstallmentsPickerProps) {
  const titleId = useId();
  const [planId, setPlanId] = useState<InstallmentPlanId>(0);
  const [draftPlanId, setDraftPlanId] = useState<InstallmentPlanId>(0);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>('list');

  const plans = useMemo(() => buildPlans(total, serviceFee), [total, serviceFee]);
  const draftPlan = plans.find((p) => p.id === draftPlanId) ?? plans[0];
  const scheduleDates = useMemo(
    () => (draftPlan.count > 0 ? installmentDates(draftPlan.count) : []),
    [draftPlan.count],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (step === 'confirm') {
        setStep('list');
        return;
      }
      setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, step]);

  const openModal = () => {
    setDraftPlanId(planId);
    setStep('list');
    setOpen(true);
  };

  const openSchedule = () => {
    setDraftPlanId(planId);
    setStep('confirm');
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setStep('list');
  };

  const selectPlan = (id: InstallmentPlanId) => {
    setDraftPlanId(id);
    if (id === 0) {
      setPlanId(0);
      closeModal();
      return;
    }
    setStep('confirm');
  };

  const agreeAndContinue = () => {
    setPlanId(draftPlanId);
    closeModal();
  };

  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0];
  const hasInstallments = planId !== 0;

  return (
    <>
      <div className="installmentsBlock">
        <button type="button" className="installmentsTrigger" onClick={openModal}>
          <span className="installmentsTrigger__text">
            <span className="installmentsTrigger__label">Installments</span>
            <span className="installmentsTrigger__value">{planSummaryLabel(planId, plans)}</span>
          </span>
          <span className="installmentsTrigger__chevron" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {hasInstallments ? (
          <div className="installmentsMeta">
            <button type="button" className="installmentsMeta__schedule" onClick={openSchedule}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M7 3h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Payment schedule
            </button>
            {selectedPlan.deposit > 0 ? (
              <p className="installmentsMeta__deposit">Deposit: {formatPrice(selectedPlan.deposit)}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="installmentsModal" role="presentation">
          <button
            type="button"
            className="installmentsModal__backdrop"
            aria-label="Close installments"
            onClick={closeModal}
          />
          <div
            className={`installmentsModal__card${step === 'confirm' ? ' installmentsModal__card--confirm' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="installmentsModal__header">
              {step === 'confirm' ? (
                <button
                  type="button"
                  className="installmentsModal__back"
                  aria-label="Back"
                  onClick={() => setStep('list')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 6l-6 6 6 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
              <h2 id={titleId} className="installmentsModal__title">
                Installments
              </h2>
              <button
                type="button"
                className="installmentsModal__close"
                aria-label="Close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {step === 'list' ? (
              <>
                <div className="installmentsModal__list" role="radiogroup" aria-labelledby={titleId}>
                  {plans.map((plan) => {
                    const selected = draftPlanId === plan.id;
                    return (
                      <label
                        key={plan.id}
                        className={`installmentsModal__option${selected ? ' installmentsModal__option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="installment-plan"
                          value={plan.id}
                          checked={selected}
                          onChange={() => selectPlan(plan.id)}
                        />
                        <span className="installmentsModal__optionMain">
                          <span className="installmentsModal__optionLabel">{plan.label}</span>
                          {plan.sublabel ? (
                            <span className="installmentsModal__optionSub">{plan.sublabel}</span>
                          ) : null}
                        </span>
                        <span className="installmentsModal__optionTotal">{plan.totalLabel}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="installmentsModal__footer">
                  <a
                    className="installmentsModal__terms"
                    href={TERMS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    T&amp;Cs for installments
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M14 5h5v5M10 14L19 5M5 9v10h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </>
            ) : (
              <div className="installmentsConfirm">
                <div className="installmentsConfirm__summary">
                  <span className="installmentsConfirm__summaryDue">
                    {formatPrice(draftPlan.dueToday)} Due today
                  </span>
                  <span className="installmentsConfirm__summaryArrow" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="installmentsConfirm__summaryPlan">
                    {formatPrice(draftPlan.perInstallment)} {draftPlan.count} payments
                  </span>
                </div>

                <ul className="installmentsConfirm__timeline">
                  <li className="installmentsConfirm__item installmentsConfirm__item--today">
                    <span className="installmentsConfirm__node" aria-hidden />
                    <div className="installmentsConfirm__itemBody">
                      <div className="installmentsConfirm__itemRow">
                        <span className="installmentsConfirm__itemLabel">Due today</span>
                        <span className="installmentsConfirm__itemAmount">
                          Total {formatPrice(draftPlan.dueToday)}
                        </span>
                      </div>
                      {draftPlan.deposit > 0 ? (
                        <div className="installmentsConfirm__detail">
                          Deposit Total {formatPrice(draftPlan.deposit)}
                        </div>
                      ) : null}
                      {draftPlan.bookingFees > 0 ? (
                        <div className="installmentsConfirm__detail">
                          Booking fees Total {formatPrice(draftPlan.bookingFees)}
                        </div>
                      ) : null}
                    </div>
                  </li>

                  {scheduleDates.map((dateLabel) => (
                    <li key={dateLabel} className="installmentsConfirm__item">
                      <span className="installmentsConfirm__node" aria-hidden />
                      <div className="installmentsConfirm__itemBody">
                        <div className="installmentsConfirm__itemRow">
                          <span className="installmentsConfirm__itemLabel">{dateLabel}</span>
                          <span className="installmentsConfirm__itemAmount">
                            Total {formatPrice(draftPlan.perInstallment)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}

                  <li className="installmentsConfirm__item installmentsConfirm__item--total">
                    <span className="installmentsConfirm__node installmentsConfirm__node--hidden" aria-hidden />
                    <div className="installmentsConfirm__itemBody">
                      <div className="installmentsConfirm__itemRow">
                        <span className="installmentsConfirm__itemLabel installmentsConfirm__itemLabel--total">
                          Total
                        </span>
                        <span className="installmentsConfirm__itemAmount installmentsConfirm__itemAmount--total">
                          Total {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>

                <p className="installmentsConfirm__legal">
                  By continuing, you agree to the{' '}
                  <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">
                    Terms and conditions for installments
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M14 5h5v5M10 14L19 5M5 9v10h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </p>

                <button type="button" className="installmentsConfirm__cta" onClick={agreeAndContinue}>
                  Agree &amp; Continue
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
