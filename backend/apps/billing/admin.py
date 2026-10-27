from django.contrib import admin
from .models import LateFeePolicy, MaintenanceInvoice, Payment

@admin.register(LateFeePolicy)
class LateFeePolicyAdmin(admin.ModelAdmin):
    list_display = ('name', 'policy_type', 'rate_or_amount', 'grace_period_days', 'is_active')
    list_filter = ('policy_type', 'is_active')

@admin.register(MaintenanceInvoice)
class MaintenanceInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'flat', 'resident', 'billing_period', 'issue_date', 'due_date', 'base_amount', 'late_fee_amount', 'total_amount', 'amount_paid', 'outstanding_balance', 'status')
    list_filter = ('status', 'billing_period', 'flat__building')
    search_fields = ('invoice_number', 'flat__flat_number', 'resident__first_name', 'resident__last_name')
    date_hierarchy = 'issue_date'
    ordering = ('-issue_date',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'invoice', 'resident', 'amount_paid', 'payment_method', 'transaction_reference', 'payment_date')
    list_filter = ('payment_method',)
    search_fields = ('receipt_number', 'transaction_reference', 'invoice__invoice_number', 'resident__first_name', 'resident__last_name')
    date_hierarchy = 'payment_date'
    ordering = ('-payment_date',)
