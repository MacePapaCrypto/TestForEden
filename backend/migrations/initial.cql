CREATE TABLE IF NOT EXISTS moon.jobs (
  id         text,
  type       text,
  data       text,
  attempts   double,
  running_at timestamp,
  created_at timestamp,
  PRIMARY KEY(type, id)
);

---

CREATE INDEX ON moon.jobs(running_at);

---

CREATE TABLE IF NOT EXISTS moon.models (
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

CREATE TABLE IF NOT EXISTS moon.nft_models (
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

CREATE TABLE IF NOT EXISTS moon.balance_models (
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

CREATE TABLE IF NOT EXISTS moon.space_models (
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

CREATE TABLE IF NOT EXISTS moon.post_models (
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

CREATE TABLE IF NOT EXISTS moon.feeds (
  id         text,
  refs       set<text>,
  sorts      set<text>,
  version    text,
  updated_at timestamp,
  created_at timestamp,
  PRIMARY KEY(id)
);

---

CREATE TABLE IF NOT EXISTS moon.feeds_asc (
  key      text,
  feed     text,
  value    double,
  model_id text,
  PRIMARY KEY((feed, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS moon.feeds_desc (
  key      text,
  feed     text,
  value    double,
  model_id text,
  PRIMARY KEY((feed, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS moon.refs_by_feed (
  ref  text,
  feed text,
  PRIMARY KEY(feed, ref)
);

---

CREATE TABLE IF NOT EXISTS moon.feeds_by_ref (
  ref  text,
  feed text,
  PRIMARY KEY(ref, feed)
);

---

CREATE TABLE IF NOT EXISTS moon.feeds_by_model (
  key      text,
  feed     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, feed, key, value)
);

---

CREATE TABLE IF NOT EXISTS moon.refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS moon.refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS moon.refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS moon.nft_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS moon.nft_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS moon.nft_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS moon.balance_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS moon.balance_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS moon.balance_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS moon.space_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS moon.space_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS moon.space_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);

---

CREATE TABLE IF NOT EXISTS moon.post_refs_asc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value ASC);

---

CREATE TABLE IF NOT EXISTS moon.post_refs_desc (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY((ref, type, key), value, model_id)
) WITH CLUSTERING ORDER BY (value DESC);

---

CREATE TABLE IF NOT EXISTS moon.post_refs_by_model (
  ref      text,
  key      text,
  type     text,
  value    double,
  model_id text,
  PRIMARY KEY(model_id, ref, type, key, value)
);