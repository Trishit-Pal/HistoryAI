# Design

## Visual Theme

A dim stone corridor at night. The visitor reads a zinc plate under a brass year rail. Committed color: the floor is the body. Brass is the signature, used large on stone.

## Color Palette

| Token | Hex | Use |
| --- | --- | --- |
| Floor | `#1A1814` | Body, corridor, rail |
| Pedestal | `#C8BBA4` | Pedestals |
| Brass | `#A6843D` | Rail, focus ring, selected hall, hall name in the room |
| Ink | `#1E2430` | Text and links on the plate |
| Plate | `#E4E7EA` | Reading panel, accuracy, changelog |
| Established | `#3D6B58` | Confirmed badge on a plate chip |
| Contested | `#A56B2A` | Reported badge |
| Unknown | `#5E6A78` | Rumored badge |
| Flag | `#8C4A2F` | Disputed badge, curator note |

On the plate, years and links use ink. Brass stays on the dark floor.

## Typography

- Display: Syne, hall names and exhibit titles. `text-wrap: balance`.
- Body: Literata, stories and accuracy copy. Max 65ch.
- Utility: IBM Plex Mono, years, badges, nav.

## Components

- **Year rail**: sticky on the floor. Label is "Show work up to". Sealed halls are disabled chips.
- **Hall chip**: plate text on stone, brass when current, dim when sealed.
- **Badge**: word on a small plate or ink chip. Unset says "unset".
- **Plate**: zinc, one h1, sources as publisher names, curator note apart from the story.
- **Ask**: stacked label, field, button.

## Layout

Desktop: corridor, then plate (`minmax(18rem, 28rem)`). Narrow: plate first, then corridor.

## Motion

Camera eases to the focused pedestal in about 1s. Reduced motion snaps. The year rail is the only ornamental control.
