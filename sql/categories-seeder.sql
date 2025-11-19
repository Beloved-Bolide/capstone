
INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(), 'Electronics', '📱' , '#4F46E5' )
ON CONFLICT (name) DO NOTHING;


INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(), 'Groceries' , '🛒' ,  '#10B981' )
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(), 'Subscriptions' ,  '📺' ,  '#F59E0B' )
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(),  'Clothing' ,   '👕' ,   '#EC4899' )
ON CONFLICT (name) DO NOTHING;


INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(),  'Travel' ,   '✈️' ,    '#06B6D4' )
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(),  'Entertainment' ,    '🎬' ,    '#8B5CF6' )
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(),   'Health & Beauty' ,    '💊'  ,    '#EF4444' )
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (id, name, icon, color)
VALUES (gen_random_uuid(),    'Home & Garden',   '🏡' ,    '#14B8A6'  )
ON CONFLICT (name) DO NOTHING;



