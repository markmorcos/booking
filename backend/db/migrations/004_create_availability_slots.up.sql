CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recurrence_rule_id UUID REFERENCES recurrence_rules(id) ON DELETE SET NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_at > starts_at)
);

CREATE INDEX idx_availability_slots_tenant_id ON availability_slots(tenant_id);
CREATE INDEX idx_availability_slots_available ON availability_slots(tenant_id, is_available, starts_at, ends_at);
CREATE INDEX idx_availability_slots_recurrence ON availability_slots(recurrence_rule_id);
