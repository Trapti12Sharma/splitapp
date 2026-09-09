/**
 * A perforated "tear line" — the visual joint between what was paid and how
 * it was split on the expense-detail ticket. Bleeds slightly past its
 * container's inline padding so the punch-hole notches sit right at the
 * card's edge, the way a real perforated stub does.
 *
 * `bleed` must match the horizontal padding of the parent it sits in (in rem)
 * so the notches land exactly on the card's outer edge rather than floating
 * inside it.
 */
const TicketDivider = ({ label, bleed = 1.5 }) => (
    <div className="relative py-1" style={{ marginLeft: `-${bleed}rem`, marginRight: `-${bleed}rem` }}>
        <div className="ticket-perforation mx-7" />
        {label && (
            <span
                className="absolute left-1/2 -translate-x-1/2 -top-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-subtle"
                style={{ background: 'var(--surface)' }}
            >
                {label}
            </span>
        )}
    </div>
)

export default TicketDivider
