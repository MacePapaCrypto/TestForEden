CREATE TABLE IF NOT EXISTS nftsocial.jobs (
  id         text,
  type       text,
  data       text,
  running_at timestamp,
  created_at timestamp,
  PRIMARY KEY((type, id), created_at)
) WITH CLUSTERING ORDER BY (created_at ASC);

---

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

CREATE TABLE IF NOT EXISTS nftsocial.nft_models (
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

CREATE TABLE IF NOT EXISTS nftsocial.balance_models (
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

CREATE TABLE IF NOT EXISTS nftsocial.space_models (
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

CREATE TABLE IF NOT EXISTS nftsocial.post_models (
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

CREATE TABLE IF NOT EXISTS nftsocial.feeds (
  id         text,
  refs       set<text>,
  sorts      set<text>,
  version    text,
  updated_at timestamp,
  created_at timestamp,
  PRIMARY KEY(id)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.feeds_asc (
  key      text,
  feed     text,
  value    double,
  model_id text,
  PRIMARY KEY((feed, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.feeds_desc (
  key      text,
  feed     text,
  value    double,
  model_id text,
  PRIMARY KEY((feed, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_by_feed (
  ref  text,
  feed text,
  PRIMARY KEY(feed, ref)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.feeds_by_ref (
  ref  text,
  feed text,
  PRIMARY KEY(ref, feed)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.feeds_by_model (
  key      text,
  feed     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, feed, key, value)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.nft_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.nft_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.nft_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.balance_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.balance_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.balance_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.space_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.space_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.space_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS nftsocial.post_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS nftsocial.post_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS nftsocial.post_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);