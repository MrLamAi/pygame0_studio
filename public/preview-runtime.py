"""Small browser display adapter, not the complete Pygame Zero library."""
import json
import inspect
import random

_commands = []
_namespace = {}

class Actor:
    def __init__(self, image, pos=(0, 0)):
        if image not in ('spaceship', 'alien', 'coin', 'ball'):
            raise ValueError('Preview images: spaceship, alien, coin, ball')
        self.image = image
        self.x, self.y = pos
        self.angle = 0
        self.width = self.height = 52
    @property
    def pos(self): return (self.x, self.y)
    @pos.setter
    def pos(self, value): self.x, self.y = value
    @property
    def left(self): return self.x - self.width / 2
    @left.setter
    def left(self, value): self.x = value + self.width / 2
    @property
    def right(self): return self.x + self.width / 2
    @right.setter
    def right(self, value): self.x = value - self.width / 2
    @property
    def top(self): return self.y - self.height / 2
    @top.setter
    def top(self, value): self.y = value + self.height / 2
    @property
    def bottom(self): return self.y + self.height / 2
    @bottom.setter
    def bottom(self, value): self.y = value - self.height / 2
    def colliderect(self, other):
        return self.left < other.right and self.right > other.left and self.top < other.bottom and self.bottom > other.top
    def draw(self):
        _commands.append(dict(kind='actor', image=self.image, x=self.x, y=self.y, angle=self.angle))

class Keyboard:
    _held = set()
    def __getattr__(self, name): return name.lower() in self._held
    def __getitem__(self, name): return name.lower() in self._held

class Keys:
    def __getattr__(self, name): return name.lower()

class ScreenDraw:
    def text(self, text, pos=(0, 0), color='white', fontsize=24):
        _commands.append(dict(kind='text', text=str(text), x=pos[0], y=pos[1], color=color, size=fontsize))

class Screen:
    draw = ScreenDraw()
    def clear(self): self.fill('black')
    def fill(self, color): _commands.append(dict(kind='fill', color=color))

keyboard = Keyboard()
screen = Screen()

def _start(source):
    global _namespace
    _namespace = dict(Actor=Actor, keyboard=keyboard, keys=Keys(), screen=screen, __name__='__main__')
    exec(compile(source, 'game.py', 'exec'), _namespace)
    unsupported = [name for name in ('on_mouse_down', 'on_mouse_up', 'on_mouse_move', 'on_key_down', 'on_key_up') if callable(_namespace.get(name))]
    if unsupported:
        raise NotImplementedError('Browser preview does not support these event hooks: ' + ', '.join(unsupported) + '. Use keyboard state in update(), or run desktop Pygame Zero.')

def _frame(advance):
    _commands.clear()
    update = _namespace.get('update')
    if advance and callable(update):
        if len(inspect.signature(update).parameters): update(1 / 60)
        else: update()
    draw = _namespace.get('draw')
    if callable(draw): draw()
    variables = {}
    for name, value in list(_namespace.items()):
        if name.startswith('_'): continue
        if isinstance(value, Actor): variables[name] = f'x={value.x:.1f}, y={value.y:.1f}'
        elif isinstance(value, (int, float, str, bool)):
            variables[name] = str(value)[:120]
    width, height = _namespace.get('WIDTH', 800), _namespace.get('HEIGHT', 600)
    if not isinstance(width, (int, float)) or not isinstance(height, (int, float)) or not (1 <= width <= 4096 and 1 <= height <= 4096):
        raise ValueError('Preview WIDTH and HEIGHT must be numbers from 1 to 4096')
    return json.dumps(dict(commands=_commands, variables=variables, width=width, height=height))
