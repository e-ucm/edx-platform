
import json
import logging

from pkg_resources import resource_string
from xmodule.raw_module import EmptyDataRawDescriptor
from xmodule.editing_module import MetadataOnlyEditingDescriptor
from xmodule.x_module import XModule

from xblock.fields import Scope, Dict, Boolean, List, Integer, String


log = logging.getLogger(__name__)

class MiniGameFields(object):
    """XFields for Minigame."""
    display_name = String(
        display_name="Display Name",
        help="Display name for this module",
        scope=Scope.settings,
        default="minigame"
    )
    

    # Fields for descriptor.
    submitted = Boolean(
        help="submitted",
        scope=Scope.user_state,
        default=False
    )

    


class MiniGameModule(MiniGameFields, XModule):
    """Minigame Xmodule"""
    js = {
        'coffee': [resource_string(__name__, 'js/src/javascript_loader.coffee')],
        'js': [resource_string(__name__, 'js/src/minigame/logme.js'),
        resource_string(__name__, 'js/src/minigame/raphael.js'),
        resource_string(__name__, 'js/src/minigame/minigame.js'),
        resource_string(__name__, 'js/src/minigame/minigame_main.js'),]
    }
    css = {'scss': [resource_string(__name__, 'css/minigame/display.scss')]}
    js_module_name = "MiniGame"

    def get_state(self):
        """Return success json answer for client."""
	
	#from courseware.models import XModuleMinigame
        #pro=XModuleMinigame.objects.filter(id=1).values()
	#num = pro[0]
	#num2 = num.get('tagline')

    	
        if self.submitted:
            return json.dumps({
                'levels': [
                    { 
                        'name' : 'first',
                        'max' : 100,
                        'progress' : '0',
                        'finished' : False
                    },           
                    { 
                        'name' : 'second',
                        'max' : 80,
                        'progress' : '0',
                        'finished' : False
                    },           
                    { 
                        'name' : 'third',
                        'max' : 40,
                        'progress' : '0',
                        'finished' : False
                    }          
                ],
                'status': 'success'
            })
        else:
            return json.dumps({
                'levels': [
                    { 
                        'name' : 'first',
                        'max' : 100,
                        'progress' : '0',
                        'finished' : False
                    },           
                    { 
                        'name' : 'second',
                        'max' : 80,
                        'progress' : '0',
                        'finished' : False
                    },           
                    { 
                        'name' : 'third',
                        'max' : 40,
                        'progress' : '0',
                        'finished' : False
                    }          
                ],
                'status': 'success'
            })

    def handle_ajax(self, dispatch, data):
        """Ajax handler.

        Args:
            dispatch: string request slug
            data: dict request get parameters

        Returns:
            json string
        """
        if dispatch == 'submit':
            if self.submitted:
                return json.dumps({
                    'status': 'fail',
                    'error': 'You have already posted your data.'
                })

            
            # FIXME: we must use raw JSON, not a post data (multipart/form-data)
            from courseware.models import XModuleMinigame
            m= XModuleMinigame(tagline= '2')
            m.save()
            return self.get_state()
        elif dispatch == 'get_state':
            return self.get_state()
        else:
            return json.dumps({
                'status': 'fail',
                'error': 'Unknown Command!'
            })

    def get_html(self):
        """Template rendering."""
        context = {
            'element_id': self.location.html_id(),
            'element_class': self.location.category,
            'ajax_url': self.system.ajax_url,
            'submitted': self.submitted
        }
        self.content = self.system.render_template('minigame.html', context)
        return self.content


class MiniGameDescriptor(MiniGameFields, MetadataOnlyEditingDescriptor, EmptyDataRawDescriptor):
    """Descriptor Minigame Xmodule."""
    module_class = MiniGameModule
    template_dir_name = 'minigame'
