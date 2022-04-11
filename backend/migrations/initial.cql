CREATE TABLE IF NOT EXISTS nftsocial.models (
    id         text,
    type       text,
    data       text,
    refs       set<text>,
    sorts      set<text>,
    version    text,
    updated_at timestamp,
    created_at timestamp,
    PRIMARY KEY((id), type)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_asc (
  ref      text,
  type     text,
  model_id text,
  PRIMARY KEY((ref, type), model_id)
) WITH CLUSTERING ORDER BY (model_id ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_desc (
  ref      text,
  type     text,
  model_id text,
  PRIMARY KEY((ref, type), model_id)
) WITH CLUSTERING ORDER BY (model_id DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_by_model (
  ref      text,
  type     text,
  model_id text,
  PRIMARY KEY(model_id, ref, type)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.sorts_asc (
  sort     bigint,
  type     text,
  model_id text,
  PRIMARY KEY((model_id, type), sort)
) WITH CLUSTERING ORDER BY (sort ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.sorts_desc (
  sort     bigint,
  type     text,
  model_id text,
  PRIMARY KEY((model_id, type), sort)
) WITH CLUSTERING ORDER BY (sort DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.sorts_by_model (
  sort     text,
  type     text,
  model_id text,
  PRIMARY KEY(model_id, sort, type)
);