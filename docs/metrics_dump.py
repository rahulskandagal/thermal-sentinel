import sqlite3, json
c = sqlite3.connect(r'C:\Users\Rahul S Kandagal\Projects\thermal-sentinel\backend\data\thermal.sqlite')
m = json.loads(c.execute("select value from meta where key='model_metrics'").fetchone()[0])
out = {
 'acc': m['accuracy'], 'rules': m['rules_only_accuracy'], 'classes': m['classes'], 'cm': m['confusion_matrix'],
 'f1': {k: round(v['f1-score'],4) for k,v in m['report'].items() if k in m['classes']},
 'prec': {k: round(v['precision'],4) for k,v in m['report'].items() if k in m['classes']},
 'rec': {k: round(v['recall'],4) for k,v in m['report'].items() if k in m['classes']},
 'imp': m['feature_importance'][:10], 'n_train': m['n_train'], 'n_test': m['n_test'],
 'by_label': dict(c.execute('select label, count(*) from hotspots group by label').fetchall()),
 'totals': c.execute('select count(*), sum(is_persistent), sum(is_anomaly), count(distinct group_id) from hotspots').fetchone(),
 'n_sources': c.execute('select count(*) from sources').fetchone()[0],
 'n_sites': c.execute('select count(*) from sites').fetchone()[0],
 'sources_by_label': dict(c.execute('select label, count(*) from sources group by label').fetchall()),
 'top': c.execute('select nearest_site_name, label, n_days, frp_mean, n_anomalies, night_frac from sources order by persistence_score desc limit 8').fetchall(),
 'anom_sites': c.execute("select nearest_site_name, n_anomalies, frp_mean, frp_max from sources where n_anomalies>0 order by n_anomalies desc limit 6").fetchall(),
 'by_day_total': c.execute("select acq_date, count(*) from hotspots group by acq_date order by acq_date").fetchall(),
}
json.dump(out, open('metrics.json','w'), indent=1)
print(json.dumps({k:v for k,v in out.items() if k!='by_day_total'}, indent=1))
