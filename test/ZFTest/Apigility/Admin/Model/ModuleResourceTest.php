<?php

namespace ZFTest\Apigility\Admin\Model;

use PHPUnit_Framework_TestCase as TestCase;
use ZF\Apigility\Admin\Model\ModuleModel;
use ZF\Apigility\Admin\Model\ModuleResource;

class ModuleResourceTest extends TestCase
{
    public function setUp()
    {
        $modules = array();
        $this->moduleManager = $this->getMockBuilder('Zend\ModuleManager\ModuleManager')
                                    ->disableOriginalConstructor()
                                    ->getMock();
        $this->moduleManager->expects($this->any())
                            ->method('getLoadedModules')
                            ->will($this->returnValue($modules));

        $this->model = new ModuleModel($this->moduleManager, array(), array());
        $this->resource = new ModuleResource($this->model);

        $this->modulePath = sprintf(
            '%s/%s',
            sys_get_temp_dir(),
            uniqid(str_replace('\\', '_', __NAMESPACE__) . '_')
        );
        mkdir($this->modulePath . '/config', 0777, true);
        $this->seedApplicationConfig();
        $this->setupModuleAutoloader();
        $this->resource->setModulePath($this->modulePath);
    }

    public function tearDown()
    {
        if ($this->modulePath && is_dir($this->modulePath)) {
            $this->removeDir($this->modulePath);
        }
    }

    public function seedApplicationConfig()
    {
        $contents = '<' . "?php\nreturn array(\n    'modules' => array(),\n);";
        file_put_contents($this->modulePath . '/config/application.config.php', $contents);
    }

    public function setupModuleAutoloader()
    {
        $modulePath = $this->modulePath;
        spl_autoload_register(function ($class) use ($modulePath) {
            if (!preg_match('/^(?P<namespace>.*?)' . preg_quote('\\') . 'Module$/', $class, $matches)) {
                return false;
            }
            $namespace = $matches['namespace'];
            $relPath   = str_replace('\\', '/', $namespace);
            $path      = sprintf('%s/module/%s/Module.php', $modulePath, $relPath);
            if (!file_exists($path)) {
                return false;
            }
            require_once $path;
            return class_exists($class, false);
        });
    }

    /**
     * Remove a directory even if not empty (recursive delete)
     *
     * @param  string $dir
     * @return boolean
     */
    public function removeDir($dir)
    {
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            $path = "$dir/$file";
            if (is_dir($path)) {
                $this->removeDir($path);
            } else {
                unlink($path);
            }
        }
        return rmdir($dir);
    }

    public function testCreateReturnsModuleWithVersion1()
    {
        $moduleName = uniqid('Foo');
        $module = $this->resource->create(array(
            'name' => $moduleName,
        ));
        $this->assertInstanceOf('ZF\Apigility\Admin\Model\ModuleEntity', $module);
        $this->assertEquals(array(1), $module->getVersions());
    }

    public function testCreateReturnsModuleWithSpecifiedVersion()
    {
        $moduleName = uniqid('Foo');
        $module = $this->resource->create(array(
            'name'    => $moduleName,
            'version' => '2'
        ));
        $this->assertInstanceOf('ZF\Apigility\Admin\Model\ModuleEntity', $module);
        $this->assertEquals(array(2), $module->getVersions());
    }

    public function testFetchModuleInjectsVersions()
    {
        $moduleName = uniqid('Foo');
        $module = $this->resource->create(array(
            'name'    => $moduleName,
            'version' => '2'
        ));
        $moduleClass = $module->getNamespace() . '\Module';

        $modules = array(
            $moduleName => new $moduleClass,
        );
        $moduleManager = $this->getMockBuilder('Zend\ModuleManager\ModuleManager')
            ->disableOriginalConstructor()
            ->getMock();
        $moduleManager->expects($this->any())
            ->method('getLoadedModules')
            ->will($this->returnValue($modules));

        $model    = new ModuleModel($moduleManager, array(
            sprintf('%s\\V1\\Rest\\Foo\\Controller', $moduleName) => true,
            sprintf('%s\\V3\\Rest\\Bar\\Controller', $moduleName) => true,
        ), array(
            sprintf('%s\\V1\\Rpc\\Baz\\Controller', $moduleName) => true,
            sprintf('%s\\V2\\Rpc\\Bat\\Controller', $moduleName) => true,
        ));
        $resource = new ModuleResource($model);
        $module   = $resource->fetch($moduleName);
        $this->assertInstanceOf('ZF\Apigility\Admin\Model\ModuleEntity', $module);
        $this->assertEquals(array(1, 2, 3), $module->getVersions());
    }
}
