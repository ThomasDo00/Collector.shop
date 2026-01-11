import { clsx } from 'clsx';
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  TagIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';
import { logger } from '@/core/logger';

export type IconName =
  | 'heart'
  | 'heart-solid'
  | 'cart'
  | 'user'
  | 'user-plus'
  | 'search'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-right'
  | 'arrow-left'
  | 'check'
  | 'warning'
  | 'info'
  | 'error'
  | 'success'
  | 'star'
  | 'star-solid'
  | 'eye'
  | 'eye-slash'
  | 'edit'
  | 'trash'
  | 'plus'
  | 'minus'
  | 'share'
  | 'chat'
  | 'bell'
  | 'settings'
  | 'logout'
  | 'home'
  | 'tag'
  | 'truck'
  | 'credit-card'
  | 'card'
  | 'shield'
  | 'clock'
  | 'location'
  | 'map'
  | 'email'
  | 'phone'
  | 'filter'
  | 'calendar'
  | 'instagram'
  | 'twitter';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  /** Icon name */
  name: IconName;
  /** Icon size */
  size?: IconSize;
  /** Additional class names */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
  /** Hide from screen readers */
  ariaHidden?: boolean;
}

const iconMap: Record<IconName, typeof HeartIcon> = {
  heart: HeartIcon,
  'heart-solid': HeartSolidIcon,
  cart: ShoppingCartIcon,
  user: UserIcon,
  'user-plus': UserPlusIcon,
  search: MagnifyingGlassIcon,
  menu: Bars3Icon,
  close: XMarkIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-left': ChevronLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  check: CheckIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
  star: StarIcon,
  'star-solid': StarSolidIcon,
  eye: EyeIcon,
  'eye-slash': EyeSlashIcon,
  edit: PencilIcon,
  trash: TrashIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  share: ShareIcon,
  chat: ChatBubbleLeftIcon,
  bell: BellIcon,
  settings: CogIcon,
  logout: ArrowRightOnRectangleIcon,
  home: HomeIcon,
  tag: TagIcon,
  truck: TruckIcon,
  'credit-card': CreditCardIcon,
  card: CreditCardIcon,
  shield: ShieldCheckIcon,
  clock: ClockIcon,
  location: MapPinIcon,
  map: MapPinIcon,
  email: EnvelopeIcon,
  phone: PhoneIcon,
  filter: AdjustmentsHorizontalIcon,
  calendar: CalendarIcon,
  // Social icons - using placeholder since heroicons doesn't have these
  instagram: ShareIcon, // Placeholder
  twitter: ShareIcon, // Placeholder
};

const sizeStyles: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

/**
 * Icon component with consistent styling
 */
function Icon({
  name,
  size = 'md',
  className,
  ariaLabel,
  ariaHidden = true,
}: Readonly<IconProps>) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    logger.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      className={clsx(sizeStyles[size], className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden && !ariaLabel}
    />
  );
}

export default Icon;
