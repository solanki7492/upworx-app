export interface Lead {
  id: number;
  order_id: number;
  booking_status_id: number;
  package_id: string;
  parent_category_id: number;
  quantity: number;
  price: number;
  visiting_inspection_cost: number | null;
  repair_cost: number | null;
  convenience_cost: number | null;
  total_price: number | null;
  tax: string;
  commission: string;
  token: string;
  deduction: number;
  service_date: string;
  service_time: string;
  message: string;
  repair_text: string | null;
  payment_status: string | null;
  transaction_id: string | null;
  assign_partner_id: number | null;
  cancel_by_id: number | null;
  assign_data: any | null;
  cancel_data: any | null;
  transaction_data: any | null;
  order_item_status: string | null;

  data: LeadServiceData;

  is_private: number;
  created_at: string;
  updated_at: string;

  pcj_order_item_id: number | null;
  pid: number | null;
  pcoid: number | null;
  pcid: number | null;
  pscid: number;
  psuid: number;
  tAmount: number | null;
  distance: number;
  range_area: number;

  partner_job: PartnerJob | null;
  order_status: OrderStatus;
  order: Order;
}

export interface LeadServiceData {
  id: string;
  name: string;
  image: string;
  slug: string;
  service_date: string;
  service_time: string;
  repair_text: string | null;
  message: string;
  services: LeadService[];
  total_service: number;
  total_quantity: number;
  total_service_price: number;
}

export interface LeadService {
  id: string;
  service: string;
  qty: string;
  price: string;
  note: string | null;
  l2: string;
  l3: string;
}

export interface Order {
  id: number;
  order_id: string;
  user_id: number;
  total_price: number;
  total_package: number;
  cancel_package: number | null;
  transaction_id: string | null;
  transaction_data: any | null;
  orders_data: string;
  address_data: Address;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  name: string;
  user_id: number;
  mobile_number: string;
  address_line_1: string;
  address_line_2: string;
  pincode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  address_type: string;
  default_address: number;
  address_for: string | null;
  range_area: number;
  coordinates_updated: number;
  created_at: string;
  updated_at: string;
}

export interface OrderStatus {
  id: number;
  name: string;
  partner_msg: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerJob {
  id: number;
  order_item_id: number;
  partner_id: number;
  lead_status_id: number;
  price: number | null;
  paid_by: string | null;
  status: string;
  booking_status_by_customer: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  status: boolean;
  data: Lead[];
  links: any[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface LeadDetailsResponse {
  status: boolean;
  data: Lead;
}