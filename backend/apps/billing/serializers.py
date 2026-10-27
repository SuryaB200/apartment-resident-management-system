from rest_framework import serializers
from .models import LateFeePolicy, MaintenanceInvoice, Payment

class LateFeePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = LateFeePolicy
        fields = [
            'id', 'name', 'policy_type', 'rate_or_amount',
            'grace_period_days', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MaintenanceInvoiceSerializer(serializers.ModelSerializer):
    flat_code = serializers.CharField(source='flat.full_flat_code', read_only=True)
    building_name = serializers.CharField(source='flat.building.name', read_only=True)
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)

    class Meta:
        model = MaintenanceInvoice
        fields = [
            'id', 'invoice_number', 'flat', 'flat_code', 'building_name',
            'resident', 'resident_name', 'billing_period', 'issue_date',
            'due_date', 'base_amount', 'late_fee_amount', 'total_amount',
            'amount_paid', 'outstanding_balance', 'status',
            'late_fee_applied', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_amount', 'outstanding_balance', 'status',
            'created_at', 'updated_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    flat_code = serializers.CharField(source='invoice.flat.full_flat_code', read_only=True)
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'receipt_number', 'invoice', 'invoice_number', 'flat_code',
            'resident', 'resident_name', 'amount_paid', 'payment_date',
            'payment_method', 'transaction_reference', 'recorded_by',
            'recorded_by_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'receipt_number', 'created_at', 'recorded_by']
