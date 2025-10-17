Conceptual model from db diagram:
https://dbdiagram.io/d/Capstone-Project-68e57557d2b621e422bc08e5

Table user {
    id uuid [primary key, not null]
    activation_token char32
    email varchar [unique, not null]
    email_notifications boolean [default: true]
    name varchar [not null]
    passwordhash char97 [not null]
}

Table folder {
    id uuid [primary key, not null]
    user_id uuid [not null]
    name varchar [not null]
    parent_folder_id uuid
}

Table record {
    id uuid [primary key, not null]
    folder_id uuid [not null]
    category_id integer [not null]
    amount decimal(10,2)
    company_name varchar
    coupon_code varchar
    description text
    exp_date date // or amount of days till return policy ends
    last_accessed_at timestamp
    notify_on boolean [default: false]
    product_id varchar // id for product
    purchase_date datetimeoffset
    warranty_exp date
}

Table file {
    id uuid [primary key, not null]
    record_id uuid [not null]
    description text
    document_date date
    file_key varchar [not null, unique]
    is_starred boolean [default: false]
    name varchar [not null]
    ocr_data text
}

Table category {
    id integer [primary key, increment, not null]
    color varchar
    icon varchar
    name varchar [not null, unique]
}

Ref: category.id > record.category_id
Ref: file.record_id > record.id [delete: set null]
Ref: folder.user_id > user.id [delete: cascade]
Ref: folder.parent_folder_id > folder.id [delete: cascade]
Ref: record.folder_id > folder.id [delete: cascade]