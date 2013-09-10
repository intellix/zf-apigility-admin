<?php

namespace ZF\ApiFirstAdmin\Model;

class RestEndpoint
{
    protected $acceptWhitelist = array();

    protected $collectionClass;

    protected $collectionHttpMethods = array('GET', 'POST');

    protected $collectionName;

    protected $collectionQueryWhitelist = array();

    protected $contentTypeWhitelist = array();

    protected $controllerServiceName;

    protected $entityClass;

    protected $identifierName;

    protected $module;

    protected $pageSize = 25;

    protected $pageSizeParam = 'page';

    protected $resourceClass;

    protected $resourceHttpMethods = array('GET', 'PATCH', 'PUT', 'DELETE');

    protected $routeMatch;

    protected $routeName;

    protected $selector = 'HalJson';

    public function __get($name)
    {
        if (!isset($this->{$name})) {
            throw new \OutOfRangeException(sprintf(
                '%s does not contain a property by the name of "%s"',
                __CLASS__,
                $name
            ));
        }
        return $this->{$name};
    }

    public function exchangeArray(array $data)
    {
        foreach ($data as $key => $value) {
            $key = strtolower($key);
            $key = str_replace('_', '', $key);
            switch ($key) {
                case 'acceptwhitelist':
                    $this->acceptWhitelist = $value;
                    break;
                case 'collectionclass':
                    $this->collectionClass = $value;
                    break;
                case 'collectionhttpmethods':
                    $this->collectionHttpMethods = $value;
                    break;
                case 'collectionname':
                    $this->collectionName = $value;
                    break;
                case 'collectionquerywhitelist':
                    $this->collectionQueryWhitelist = $value;
                    break;
                case 'contenttypewhitelist':
                    $this->contentTypeWhitelist = $value;
                    break;
                case 'controllerservicename':
                    $this->controllerServiceName = $value;
                    break;
                case 'entityclass':
                    $this->entityClass = $value;
                    break;
                case 'identifiername':
                    $this->identifierName = $value;
                    break;
                case 'module':
                    $this->module = $value;
                    break;
                case 'pagesize':
                    $this->pageSize = $value;
                    break;
                case 'pagesizeparam':
                    $this->pageSizeParam = $value;
                    break;
                case 'resourceclass':
                    $this->resourceClass = $value;
                    break;
                case 'resourcehttpmethods':
                    $this->resourceHttpMethods = $value;
                    break;
                case 'routematch':
                    $this->routeMatch = $value;
                    break;
                case 'routename':
                    $this->routeName = $value;
                    break;
                case 'selector':
                    $this->selector = $value;
                    break;
            }
        }
    }

    public function getArrayCopy()
    {
        return array(
            'accept_whitelist'           => $this->acceptWhitelist,
            'collection_class'           => $this->collectionClass,
            'collection_http_methods'    => $this->collectionHttpMethods,
            'collection_name'            => $this->collectionName,
            'collection_query_whitelist' => $this->collectionQueryWhitelist,
            'content_type_whitelist'     => $this->contentTypeWhitelist,
            'controller_service_name'    => $this->controllerServiceName,
            'entity_class'               => $this->entityClass,
            'identifier_name'            => $this->identifierName,
            'module'                     => $this->module,
            'page_size'                  => $this->pageSize,
            'page_size_param'            => $this->pageSizeParam,
            'resource_class'             => $this->resourceClass,
            'resource_http_methods'      => $this->resourceHttpMethods,
            'route_match'                => $this->routeMatch,
            'route_name'                 => $this->routeName,
            'selector'                   => $this->selector,
        );
    }
}
