from django import forms
from django.core.validators import RegexValidator
from datetime import date, timedelta
from .models import ServiceRequest

class ServiceRequestForm(forms.ModelForm):
    """
    Form for creating service requests with enhanced interface
    """
    phone = forms.CharField(
        max_length=20,
        validators=[RegexValidator(r'^[\+]?[1-9][\d]{0,15}$', 'Please enter a valid phone number')],
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+44 _____ ______',
            'pattern': r'^[\+]?[1-9][\d]{0,15}$'
        })
    )
    
    preferred_time = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Click to select date and time',
            'readonly': True
        })
    )
    
    service_type = forms.ChoiceField(
        choices=[('', 'Select service type')] + ServiceRequest.SERVICE_TYPE_CHOICES,
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )
    
    urgency = forms.ChoiceField(
        choices=ServiceRequest.URGENCY_CHOICES,
        initial='medium',
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )
    
    class Meta:
        model = ServiceRequest
        fields = [
            'name', 'phone', 'email', 'car_brand',
            'pickup_location', 'destination', 'service_type', 'urgency',
            'preferred_time', 'message'
        ]
        
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Your name'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'example@email.com'
            }),
            'car_brand': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. BMW X5, Ford Focus'
            }),
            'pickup_location': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Where should we collect your vehicle?'
            }),
            'destination': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Where should we deliver your vehicle?'
            }),
            'message': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'We will contact you to confirm your appointment'
            })
        }
    
    def clean_preferred_time(self):
        """
        Validate preferred time format
        """
        preferred_time = self.cleaned_data.get('preferred_time')
        if preferred_time:
            # Basic validation - just check if it's not empty
            preferred_time = preferred_time.strip()
            if not preferred_time:
                return None
        return preferred_time 