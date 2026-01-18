# Generated migration for base_font_size field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('masterResume', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='masterresume',
            name='base_font_size',
            field=models.IntegerField(default=11, help_text='Base font size in pt (detected from imported resume)'),
        ),
    ]
