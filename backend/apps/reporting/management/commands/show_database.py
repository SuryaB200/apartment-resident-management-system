import sqlite3
from django.core.management.base import BaseCommand
from django.conf import settings
from django.apps import apps

class Command(BaseCommand):
    help = 'Displays an executive summary of all relational tables, record counts, and database status.'

    def add_arguments(self, parser):
        parser.add_argument('--table', type=str, help='Print top 5 rows for a specific table name')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("=" * 75))
        self.stdout.write(self.style.SUCCESS("  CIVICQUARTERS DBMS - 3NF RELATIONAL DATABASE INSPECTOR"))
        self.stdout.write(self.style.SUCCESS("=" * 75))

        db_path = settings.DATABASES['default']['NAME']
        self.stdout.write(f"Database File : {db_path}")
        self.stdout.write(f"Engine        : {settings.DATABASES['default']['ENGINE']}\n")

        # Table statistics
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
        all_tables = [r[0] for r in cur.fetchall()]

        capstone_tables = [t for t in all_tables if not t.startswith(('django_', 'auth_'))]
        auth_tables = [t for t in all_tables if t.startswith(('django_', 'auth_'))]

        self.stdout.write(self.style.HTTP_INFO(f"{'Table Name':<35} | {'Classification':<18} | {'Rows':>8}"))
        self.stdout.write("-" * 75)

        total_rows = 0
        for t in capstone_tables:
            cur.execute(f"SELECT COUNT(1) FROM [{t}]")
            cnt = cur.fetchone()[0]
            total_rows += cnt
            self.stdout.write(f"{t:<35} | {'Capstone 3NF':<18} | {cnt:>8}")

        self.stdout.write("-" * 75)
        for t in auth_tables:
            cur.execute(f"SELECT COUNT(1) FROM [{t}]")
            cnt = cur.fetchone()[0]
            total_rows += cnt
            self.stdout.write(f"{t:<35} | {'Framework / Auth':<18} | {cnt:>8}")

        self.stdout.write("-" * 75)
        self.stdout.write(self.style.SUCCESS(f"Total Database Rows Across All Tables: {total_rows}"))
        self.stdout.write(self.style.SUCCESS("=" * 75))

        target_table = options.get('table')
        if target_table:
            if target_table not in all_tables:
                self.stdout.write(self.style.ERROR(f"Table '{target_table}' not found!"))
                return
            self.stdout.write(self.style.HTTP_INFO(f"\nPreviewing top 5 records from: {target_table}"))
            cur.execute(f"PRAGMA table_info([{target_table}])")
            cols = [col[1] for col in cur.fetchall()]
            self.stdout.write(f"Columns: {', '.join(cols)}")
            cur.execute(f"SELECT * FROM [{target_table}] LIMIT 5;")
            rows = cur.fetchall()
            for idx, row in enumerate(rows, 1):
                self.stdout.write(f"[{idx}] {row}")

        conn.close()
