interface Props {
  size?: number
}

export function Logo({ size = 36 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#0d0d0d"/>
      <rect x="12"  y="44" width="76" height="12" rx="6"  fill="#f0f0f0"/>
      <rect x="10"  y="28" width="15" height="44" rx="5"  fill="#e8192c"/>
      <rect x="27"  y="34" width="10" height="32" rx="4"  fill="#b81020"/>
      <rect x="63"  y="34" width="10" height="32" rx="4"  fill="#b81020"/>
      <rect x="75"  y="28" width="15" height="44" rx="5"  fill="#e8192c"/>
    </svg>
  )
}
